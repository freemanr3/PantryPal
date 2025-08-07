import { APIGatewayProxyHandler } from 'aws-lambda';
import { SpoonacularClient, EdamamClient } from '/opt/nodejs/lib/api-clients';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import * as AWSXRay from 'aws-xray-sdk-core';

const ddbClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const docClient = DynamoDBDocumentClient.from(ddbClient);

interface SearchOptions {
  ingredients: string[];
  diet?: string;
  intolerances?: string[];
  maxReadyTime?: number;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  AWSXRay.captureFunc('RecipeSearchHandler', async (subsegment) => {
    try {
      console.log('Recipe search event:', JSON.stringify(event));
      const options: SearchOptions = event.queryStringParameters?.options
        ? JSON.parse(decodeURIComponent(event.queryStringParameters.options))
        : { ingredients: [] };

      // Search in DynamoDB for recently searched recipes
      const recentSearchKey = `recent:${options.ingredients.sort().join(',')}`;
      const recentResults = await docClient.send(new QueryCommand({
        TableName: process.env.RECIPES_TABLE,
        IndexName: 'ingredients-index',
        KeyConditionExpression: 'ingredientsKey = :key',
        ExpressionAttributeValues: {
          ':key': recentSearchKey
        },
        Limit: 10
      }));

      if (recentResults.Items && recentResults.Items.length >= 10) {
        subsegment?.addAnnotation('source', 'dynamodb');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
          },
          body: JSON.stringify({
            source: 'dynamodb',
            results: recentResults.Items
          })
        };
      }

      // Search both APIs in parallel
      const [spoonacular, edamam] = await Promise.all([
        SpoonacularClient.getInstance(),
        EdamamClient.getInstance()
      ]);

      const [spoonacularResults, edamamResults] = await Promise.all([
        spoonacular.searchRecipes(options.ingredients),
        edamam.searchRecipes(options.ingredients)
      ]);

      // Merge and deduplicate results
      const allResults = [...spoonacularResults, ...edamamResults]
        .filter(recipe => {
          // Apply filters
          if (options.diet && !recipe.diets?.includes(options.diet)) return false;
          if (options.maxReadyTime && recipe.readyInMinutes > options.maxReadyTime) return false;
          if (options.intolerances?.some(intolerance => 
            !recipe.diets?.includes(`${intolerance}-free`)
          )) return false;
          return true;
        })
        .reduce((unique: any[], recipe: any) => {
          // Deduplicate by title similarity
          const isDuplicate = unique.some(r => 
            r.title.toLowerCase() === recipe.title.toLowerCase()
          );
          if (!isDuplicate) unique.push(recipe);
          return unique;
        }, [])
        .slice(0, 10); // Limit to 10 results

      // Store results in DynamoDB with TTL
      const ttl = Math.floor(Date.now() / 1000) + 86400; // 24 hours
      await Promise.all(allResults.map(recipe =>
        docClient.send(new PutCommand({
          TableName: process.env.RECIPES_TABLE,
          Item: {
            ...recipe,
            ingredientsKey: recentSearchKey,
            ttl
          }
        }))
      ));

      subsegment?.addAnnotation('source', 'api');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        },
        body: JSON.stringify({
          source: 'api',
          results: allResults
        })
      };
    } catch (error) {
      console.error('Search error:', error);
      subsegment?.addError(error as Error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal server error'
        })
      };
    } finally {
      subsegment?.close();
    }
  });
}; 