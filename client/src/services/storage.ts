import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export class StorageService {
  static async uploadProfilePicture(file: File, userId: string) {
    const key = `private/${userId}/profile/${file.name}`;
    return await this.uploadFile(file, key);
  }

  static async uploadCustomRecipeImage(file: File, recipeId: string, userId: string) {
    const key = `protected/recipes/${userId}/${recipeId}/${file.name}`;
    return await this.uploadFile(file, key);
  }

  static async uploadScannedIngredient(file: File, userId: string) {
    const key = `private/${userId}/ingredients/${file.name}`;
    return await this.uploadFile(file, key);
  }

  static async cacheApiImage(imageUrl: string, apiSource: 'spoonacular' | 'edamam', imageId: string) {
    try {
      // Check if image is already cached
      const cacheKey = `cache/${apiSource}/${imageId}`;
      try {
        const cachedUrl = await this.getImageUrl(cacheKey);
        if (cachedUrl) return cachedUrl;
      } catch (e) {
        // Image not cached, continue to cache it
      }

      // Fetch image from API
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${imageId}.jpg`, { type: 'image/jpeg' });

      // Upload to S3
      await this.uploadFile(file, cacheKey);
      return await this.getImageUrl(cacheKey);
    } catch (error) {
      console.error('Error caching API image:', error);
      // Return original URL if caching fails
      return imageUrl;
    }
  }

  private static async uploadFile(file: File, key: string) {
    try {
      const result = await uploadData({
        key,
        data: file,
        options: {
          contentType: file.type,
          accessLevel: key.startsWith('public/') ? 'public' : 
                      key.startsWith('protected/') ? 'protected' : 'private'
        }
      });
      return result.key;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async getImageUrl(key: string) {
    try {
      const accessLevel = key.startsWith('public/') ? 'public' : 
                         key.startsWith('protected/') ? 'protected' : 'private';
      return await getUrl({
        key,
        options: {
          accessLevel,
          expiresIn: accessLevel === 'private' ? 3600 : 86400 // 1 hour for private, 24 hours for others
        }
      });
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw error;
    }
  }

  static async deleteImage(key: string) {
    try {
      const accessLevel = key.startsWith('public/') ? 'public' : 
                         key.startsWith('protected/') ? 'protected' : 'private';
      await remove({
        key,
        options: {
          accessLevel
        }
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
} 