// Updated secrets section with real API keys - REPLACE lines 238-248 in your pantry-pal-stack.ts

    // Secrets with real API keys
    const apiKeys = new secretsmanager.Secret(this, 'ExternalApiKeys', {
      secretName: 'pantry-pal/api-keys',
      secretValue: secretsmanager.SecretValue.unsafePlainText(JSON.stringify({
        SPOONACULAR_API_KEY: 'e551a15401d14103b79ca1d865daa038',
        EDAMAM_APP_ID: '893b140e',
        EDAMAM_APP_KEY: '8edfacd2f98015dd77e9dc3220a31fe3',
        STRIPE_SECRET_KEY: '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',
        STRIPE_WEBHOOK_SECRET: 'whsec_UxzRlAVuhWH7OxWVOs244Q1GslWyWwec',
        STRIPE_PREMIUM_PRICE_ID: 'price_1RNusNGUd62jKHFhVMp4rWhc',
        STRIPE_CHEF_PRICE_ID: 'price_1RTYqOGUd62jKHFhMOvZX7gH'
      }))
    });
