import { APIGatewayProxyHandler } from 'aws-lambda';
import { SpoonacularClient } from '/opt/nodejs/lib/api-clients';
import { Cache } from '/opt/nodejs/lib/cache';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const recipeId = event.pathParameters?.id;
    if (!recipeId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing recipe ID' })
      };
    }

    const cache = await Cache.getInstance();
    const cacheKey = `recipe:${recipeId}`;

    // Check cache first
    const cachedRecipe = await cache.get(cacheKey);
    if (cachedRecipe) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        },
        body: JSON.stringify({
          source: 'cache',
          recipe: cachedRecipe
        })
      };
    }

    // Check DynamoDB
    const { Item: savedRecipe } = await docClient.send(new GetCommand({
      TableName: process.env.RECIPES_TABLE,
      Key: { recipeId }
    }));

    if (savedRecipe) {
      await cache.set(cacheKey, savedRecipe, 3600);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600'
        },
        body: JSON.stringify({
          source: 'dynamodb',
          recipe: savedRecipe
        })
      };
    }

    // Fetch from Spoonacular
    const spoonacular = await SpoonacularClient.getInstance();
    const recipe = await spoonacular.getRecipeDetails(parseInt(recipeId));

    // Cache the result
    await cache.set(cacheKey, recipe, 3600);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      },
      body: JSON.stringify({
        source: 'api',
        recipe
      })
    };

  } catch (error) {
    console.error('Recipe details error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error'
      })
    };
  }
}; 