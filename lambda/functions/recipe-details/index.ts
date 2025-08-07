import { APIGatewayProxyHandler } from 'aws-lambda';
import { SpoonacularClient } from '/opt/nodejs/lib/api-clients';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import * as AWSXRay from 'aws-xray-sdk-core';

const ddbClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const docClient = DynamoDBDocumentClient.from(ddbClient);

export const handler: APIGatewayProxyHandler = async (event) => {
  AWSXRay.captureFunc('RecipeDetailsHandler', async (subsegment) => {
    try {
      console.log('Recipe details event:', JSON.stringify(event));
      const recipeId = event.pathParameters?.id;
      if (!recipeId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Missing recipe ID' })
        };
      }

      // Check DynamoDB
      const { Item: savedRecipe } = await docClient.send(new GetCommand({
        TableName: process.env.RECIPES_TABLE,
        Key: { recipeId }
      }));

      if (savedRecipe) {
        subsegment?.addAnnotation('source', 'dynamodb');
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

      subsegment?.addAnnotation('source', 'api');
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