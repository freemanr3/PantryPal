import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  UpdateCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import * as AWSXRay from 'aws-xray-sdk-core';

const ddbClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({}));
const docClient = DynamoDBDocumentClient.from(ddbClient);

interface UserPreferences {
  userId: string;
  dietaryPreferences: string[];
  intolerances: string[];
  cookingTime: number;
  budget: number;
  isPremium: boolean;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  AWSXRay.captureFunc('UserPreferencesHandler', async (subsegment) => {
    try {
      console.log('User preferences event:', JSON.stringify(event));
      const userId = event.pathParameters?.userId;
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Missing userId' })
        };
      }

      switch (event.httpMethod) {
        case 'GET': {
          // Get user preferences
          const { Item } = await docClient.send(new GetCommand({
            TableName: process.env.USERS_TABLE,
            Key: { userId }
          }));

          if (!Item) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: 'User not found' })
            };
          }

          return {
            statusCode: 200,
            body: JSON.stringify(Item)
          };
        }
        case 'PUT': {
          const preferences: Partial<UserPreferences> = JSON.parse(event.body || '{}');
          // Update user preferences
          await docClient.send(new UpdateCommand({
            TableName: process.env.USERS_TABLE,
            Key: { userId },
            UpdateExpression: 'set #prefs = :prefs, #intol = :intol, #time = :time, #budget = :budget',
            ExpressionAttributeNames: {
              '#prefs': 'dietaryPreferences',
              '#intol': 'intolerances',
              '#time': 'cookingTime',
              '#budget': 'budget'
            },
            ExpressionAttributeValues: {
              ':prefs': preferences.dietaryPreferences || [],
              ':intol': preferences.intolerances || [],
              ':time': preferences.cookingTime || 60,
              ':budget': preferences.budget || 100
            }
          }));

          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Preferences updated successfully' })
          };
        }
        case 'POST': {
          if (event.path.endsWith('/saved-recipes')) {
            const { recipeId } = JSON.parse(event.body || '{}');
            // Check if user has reached daily limit
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { Items: savedToday } = await docClient.send(new QueryCommand({
              TableName: process.env.USERS_TABLE,
              KeyConditionExpression: 'userId = :userId',
              FilterExpression: 'savedAt >= :today',
              ExpressionAttributeValues: {
                ':userId': userId,
                ':today': today.toISOString()
              },
              IndexName: 'saved-recipes-index'
            }));
            const user = await docClient.send(new GetCommand({
              TableName: process.env.USERS_TABLE,
              Key: { userId }
            }));
            if (!user.Item?.isPremium && savedToday && savedToday.length >= 10) {
              return {
                statusCode: 403,
                body: JSON.stringify({
                  message: 'Daily save limit reached',
                  upgrade: true
                })
              };
            }
            // Save recipe
            await docClient.send(new PutCommand({
              TableName: process.env.USERS_TABLE,
              Item: {
                userId,
                recipeId,
                savedAt: new Date().toISOString()
              }
            }));
            return {
              statusCode: 200,
              body: JSON.stringify({ message: 'Recipe saved successfully' })
            };
          }
          break;
        }
        default:
          return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
          };
      }
    } catch (error) {
      console.error('User preferences error:', error);
      subsegment?.addError(error as Error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal server error' })
      };
    } finally {
      subsegment?.close();
    }
  });
}; 