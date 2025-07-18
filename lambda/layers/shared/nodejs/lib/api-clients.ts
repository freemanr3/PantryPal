import axios from 'axios';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({});

interface ApiKeys {
  SPOONACULAR_API_KEY: string;
  EDAMAM_APP_ID: string;
  EDAMAM_APP_KEY: string;
}

async function getApiKeys(): Promise<ApiKeys> {
  const response = await secretsClient.send(
    new GetSecretValueCommand({
      SecretId: process.env.API_KEYS_SECRET
    })
  );
  return JSON.parse(response.SecretString || '{}');
}

export class SpoonacularClient {
  private static instance: SpoonacularClient;
  private apiKey: string | null = null;
  private baseUrl = 'https://api.spoonacular.com/recipes';

  private constructor() {}

  static async getInstance(): Promise<SpoonacularClient> {
    if (!SpoonacularClient.instance) {
      SpoonacularClient.instance = new SpoonacularClient();
      const keys = await getApiKeys();
      SpoonacularClient.instance.apiKey = keys.SPOONACULAR_API_KEY;
    }
    return SpoonacularClient.instance;
  }

  async searchRecipes(ingredients: string[]): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/findByIngredients`, {
      params: {
        apiKey: this.apiKey,
        ingredients: ingredients.join(','),
        number: 10,
        ranking: 2,
        ignorePantry: true
      }
    });
    return response.data;
  }

  async getRecipeDetails(id: number): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/${id}/information`, {
      params: {
        apiKey: this.apiKey
      }
    });
    return response.data;
  }
}

export class EdamamClient {
  private static instance: EdamamClient;
  private appId: string | null = null;
  private appKey: string | null = null;
  private baseUrl = 'https://api.edamam.com/api/recipes/v2';

  private constructor() {}

  static async getInstance(): Promise<EdamamClient> {
    if (!EdamamClient.instance) {
      EdamamClient.instance = new EdamamClient();
      const keys = await getApiKeys();
      EdamamClient.instance.appId = keys.EDAMAM_APP_ID;
      EdamamClient.instance.appKey = keys.EDAMAM_APP_KEY;
    }
    return EdamamClient.instance;
  }

  async searchRecipes(ingredients: string[]): Promise<any> {
    const response = await axios.get(this.baseUrl, {
      params: {
        type: 'public',
        q: ingredients.join(' '),
        app_id: this.appId,
        app_key: this.appKey
      }
    });
    return response.data.hits.map((hit: any) => hit.recipe);
  }
} 