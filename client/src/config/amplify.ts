import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';

// Initialize Amplify on the client side
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.VITE_COGNITO_CLIENT_ID!,
      signUpVerificationMethod: 'code',
    }
  },
  Storage: {
    S3: {
      bucket: process.env.VITE_S3_BUCKET!,
      region: process.env.VITE_AWS_REGION!,
    }
  }
});

// Helper functions for storage operations
export const uploadImage = async (file: File, key: string) => {
  try {
    const result = await uploadData({
      key,
      data: file,
      options: {
        contentType: file.type,
        accessLevel: 'public'
      }
    });
    return result.key;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getImageUrl = async (key: string) => {
  try {
    return await getUrl({
      key,
      options: {
        accessLevel: 'public',
        expiresIn: 3600 // 1 hour
      }
    });
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

export const deleteImage = async (key: string) => {
  try {
    await remove({
      key,
      options: {
        accessLevel: 'public'
      }
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Generate API client
export const client = generateClient(); 