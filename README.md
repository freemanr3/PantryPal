# Pantry Pal

A modern recipe discovery application that helps users find recipes based on their available ingredients, dietary preferences, and cooking constraints.

## Features

- Recipe search by ingredients
- Dietary preferences and restrictions
- Recipe saving with daily limits (10 recipes for free users)
- Premium user features
- Image optimization and caching
- Print-friendly recipe pages

## Architecture

The application uses a modern serverless architecture on AWS:

- Frontend: React + TypeScript
- Backend: AWS Lambda + API Gateway
- Storage: S3 + DynamoDB
- Caching: Redis (ElastiCache) + CloudFront
- Authentication: Cognito
- Image Processing: Lambda + Sharp
- Deployment: AWS Amplify

## Setup

### Prerequisites

- Node.js 18+
- AWS CLI configured
- AWS CDK CLI
- Docker (for local development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pantry-pal.git
cd pantry-pal
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../lambda
npm install
```

4. Deploy infrastructure:
```bash
cd ../infrastructure
npm install
cdk deploy
```

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=your_api_gateway_url
VITE_USER_POOL_ID=your_cognito_user_pool_id
VITE_USER_POOL_CLIENT_ID=your_cognito_client_id
VITE_IDENTITY_POOL_ID=your_cognito_identity_pool_id
VITE_REGION=your_aws_region
```

### Development

1. Start the frontend development server:
```bash
cd client
npm run dev
```

2. Build and test Lambda functions:
```bash
cd lambda
npm run build
npm test
```

### Deployment

The application is automatically deployed through AWS Amplify when changes are pushed to the main branch. The `amplify.yml` file defines the build and deployment process.

## API Documentation

### Recipe Search API

- `GET /recipes?options={...}`: Search recipes by ingredients and preferences
- `GET /recipes/{id}`: Get detailed recipe information

### User Preferences API

- `GET /users/{userId}`: Get user preferences
- `PUT /users/{userId}`: Update user preferences
- `POST /users/{userId}/saved-recipes`: Save a recipe

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
