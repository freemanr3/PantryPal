# AWS Cognito Setup Guide for PantryPal

This guide will help you configure AWS Cognito authentication for the PantryPal application.

## Step 1: Create an AWS Cognito User Pool

1. Log into the [AWS Management Console](https://aws.amazon.com/console/)
2. Search for "Cognito" in the services search bar
3. Select "Cognito" from the search results
4. Click on "User Pools" in the left sidebar
5. Click "Create a user pool"
6. For "Cognito user pool sign-in options", select:
   - Email (required)
   - (Optional) You can also add "Username" if you want users to sign in with a username
7. Click "Next"
8. Under "Password policy", select "Cognito defaults" or customize as needed
9. For Multi-factor authentication (MFA), select "No MFA" for simplicity, or choose your preferred option
10. Under "User account recovery", keep "Enable self-service account recovery" enabled
11. Click "Next"
12. Under "Required attributes", make sure to include:
    - Email
    - Name (optional, but recommended)
13. Click "Next"
14. For "Email delivery", select "Send email with Cognito" for simplicity
15. On the "Configure message delivery" page, use the default settings
16. Click "Next"
17. Name your user pool something like "PantryPalUserPool"
18. Under "Initial app client", set:
    - App type: "Public client"
    - App client name: "PantryPalWebClient"
19. Under "Advanced app client settings", enable:
    - ALLOW_USER_PASSWORD_AUTH flow (essential for username/password login)
20. Click "Next"
21. Review your settings and click "Create user pool"

## Step 2: Configure the App Client

1. After creating the user pool, click on "App integration" in the left sidebar
2. Scroll down to "App clients" and click the app client you created
3. Make a note of the "Client ID" - you'll need this for your configuration
4. Under "Hosted UI", click "Edit"
5. Configure the following settings:
   - Enable Hosted UI: Yes
   - Allowed callback URLs: `http://localhost:5173/oauth/callback,https://your-production-domain.com/oauth/callback`
   - Allowed sign-out URLs: `http://localhost:5173,https://your-production-domain.com`
   - Identity providers: Check "Cognito user pool"
6. Click "Save changes"

## Step 3: Update AWS Configuration File

Update the `client/src/config/aws-exports.js` file with your actual values:

```javascript
const awsconfig = {
  aws_project_region: "us-east-1", // Your AWS region
  aws_cognito_region: "us-east-1", // Your AWS region
  aws_user_pools_id: "us-east-1_XXXXXXXXX", // Your User Pool ID
  aws_user_pools_web_client_id: "XXXXXXXXXXXXXXXXXXXXXXXXXX", // Your App Client ID
  
  // Authentication settings
  Auth: {
    // Optional, used for Amazon Cognito hosted UI specified in the Auth documentation
    oauth: {
      domain: "your-domain.auth.us-east-1.amazoncognito.com", // Your Hosted UI domain
      scope: ["email", "profile", "openid"],
      redirectSignIn: "http://localhost:5173/oauth/callback", // Replace with your actual callback URL
      redirectSignOut: "http://localhost:5173/", // Replace with your sign-out URL
      responseType: "code"
    }
  }
};

export default awsconfig;
```

## Step 4: Test Authentication

1. Start your application with `npm run dev`
2. Navigate to the login page
3. Try creating a new account
4. Check your email for the verification code
5. Enter the verification code to confirm your account
6. Log in with your credentials

## Troubleshooting

### Common Issues

1. **Invalid Configuration**:
   - Double-check your User Pool ID and App Client ID
   - Make sure your region is correct

2. **CORS Errors**:
   - Ensure that the callback URLs are properly configured in the Cognito console
   - Check for any CORS errors in the browser console

3. **Authentication Failures**:
   - Verify that ALLOW_USER_PASSWORD_AUTH is enabled in your app client
   - Check that the user's email is verified

4. **Debug Logging**:
   - Enable debug logging by adding this code before initializing Amplify:
   ```javascript
   Amplify.Logger.LOG_LEVEL = 'DEBUG';
   ```

### Additional Resources

- [AWS Amplify Authentication Documentation](https://docs.amplify.aws/lib/auth/getting-started/)
- [AWS Cognito User Pools Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [Amplify Authentication API Reference](https://docs.amplify.aws/javascript/build-a-backend/auth/) 