import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

interface SwipeRecord {
  userId: string;
  dailySwipeCount: number;
  dailySwipeResetDate: string;
  isPremium: boolean;
  swipeHistory: Array<{
    timestamp: string;
    recipeId: string;
    action: 'like' | 'skip';
  }>;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { userId, recipeId, action } = JSON.parse(event.body || '{}');
    
    if (!userId || !recipeId || !action) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: userId, recipeId, action' 
        })
      };
    }

    // Get current user data
    const { Item: user } = await docClient.send(new GetCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId }
    }));

    if (!user) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toISOString();
    
    // Check if we need to reset daily count
    const shouldResetDaily = !user.dailySwipeResetDate || user.dailySwipeResetDate !== today;
    
    let currentSwipeCount = shouldResetDaily ? 0 : (user.dailySwipeCount || 0);
    let swipeHistory = user.swipeHistory || [];

    // For free users, check daily limit
    if (!user.isPremium && !shouldResetDaily && currentSwipeCount >= 10) {
      // Calculate time until reset (midnight)
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const hoursUntilReset = Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          error: 'Daily swipe limit reached',
          limit: 10,
          currentCount: currentSwipeCount,
          hoursUntilReset,
          upgrade: true,
          message: `You've reached your daily limit of 10 swipes. Upgrade to Premium for unlimited swipes or wait ${hoursUntilReset} hours for reset.`
        })
      };
    }

    // Increment swipe count
    const newSwipeCount = currentSwipeCount + 1;
    
    // Add to swipe history (keep last 50 swipes)
    const newSwipeEntry = {
      timestamp: currentTime,
      recipeId,
      action: action as 'like' | 'skip'
    };
    
    swipeHistory = [newSwipeEntry, ...swipeHistory].slice(0, 50);

    // Update user record
    await docClient.send(new UpdateCommand({
      TableName: process.env.USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET dailySwipeCount = :count, dailySwipeResetDate = :date, swipeHistory = :history, lastSwipeTime = :time',
      ExpressionAttributeValues: {
        ':count': newSwipeCount,
        ':date': today,
        ':history': swipeHistory,
        ':time': currentTime
      }
    }));

    // Calculate remaining swipes for free users
    const remainingSwipes = user.isPremium ? 'unlimited' : Math.max(0, 10 - newSwipeCount);
    const hoursUntilReset = user.isPremium ? null : (() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return Math.ceil((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
    })();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        swipeCount: newSwipeCount,
        remainingSwipes,
        hoursUntilReset,
        isPremium: user.isPremium,
        dailyLimit: user.isPremium ? null : 10,
        message: user.isPremium 
          ? 'Swipe recorded - unlimited swipes available'
          : `Swipe recorded - ${remainingSwipes} swipes remaining today`
      })
    };

  } catch (error) {
    console.error('Swipe tracking error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

// OPTIONS handler for CORS
export const optionsHandler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
    },
    body: ''
  };
}; 