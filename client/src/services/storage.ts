import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export class StorageService {
  static async uploadProfilePicture(file: File, userId: string) {
    const path = `private/${userId}/profile/${file.name}`;
    return await this.uploadFile(file, path);
  }

  static async uploadCustomRecipeImage(file: File, recipeId: string, userId: string) {
    const path = `protected/recipes/${userId}/${recipeId}/${file.name}`;
    return await this.uploadFile(file, path);
  }

  static async uploadScannedIngredient(file: File, userId: string) {
    const path = `private/${userId}/ingredients/${file.name}`;
    return await this.uploadFile(file, path);
  }

  static async cacheApiImage(imageUrl: string, apiSource: 'spoonacular' | 'edamam', imageId: string) {
    try {
      // Check if image is already cached
      const cachePath = `cache/${apiSource}/${imageId}`;
      try {
        const cachedUrl = await this.getImageUrl(cachePath);
        if (cachedUrl) return cachedUrl;
      } catch (e) {
        // Image not cached, continue to cache it
      }

      // Fetch image from API
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `${imageId}.jpg`, { type: 'image/jpeg' });

      // Upload to S3
      await this.uploadFile(file, cachePath);
      return await this.getImageUrl(cachePath);
    } catch (error) {
      console.error('Error caching API image:', error);
      // Return original URL if caching fails
      return imageUrl;
    }
  }

  private static async uploadFile(file: File, path: string) {
    try {
      const result = await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type
        }
      });
      return result.result.path;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async getImageUrl(path: string) {
    try {
      const result = await getUrl({
        path,
        options: {
          expiresIn: 3600 // 1 hour
        }
      });
      return result.url;
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw error;
    }
  }

  static async deleteImage(path: string) {
    try {
      await remove({
        path
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}