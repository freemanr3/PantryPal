import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';

// Initialize Amplify on the client side
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'us-east-2_YWfa08XCX',
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '4sj8htmmqst54qdg7joa8guams',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
      },
    }
  },
  Storage: {
    S3: {
      bucket: import.meta.env.VITE_S3_BUCKET || '',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-2',
    }
  }
});

// Helper functions for storage operations
export const uploadImage = async (file: File, key: string) => {
  try {
    const result = await uploadData({
      path: key,
      data: file,
      options: {
        contentType: file.type
      }
    });
    const uploadResult = await result.result;
    return uploadResult.path;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getImageUrl = async (path: string) => {
  try {
    return await getUrl({
      path,
      options: {
        expiresIn: 3600 // 1 hour
      }
    });
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

export const deleteImage = async (path: string) => {
  try {
    await remove({
      path
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Generate API client
export const client = generateClient(); 