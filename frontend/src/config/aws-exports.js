/* eslint-disable */
// AWS Cognito Configuration - Replace these values with your actual AWS Cognito settings
const awsConfig = {
    "aws_project_region": "us-east-2", // Replace with your AWS region
    "aws_cognito_region": "us-east-2", // Replace with your Cognito region (usually same as project region)
    "aws_user_pools_id": "us-east-2_YWfa08XCX", // Replace with your User Pool ID
    "aws_user_pools_web_client_id": "4sj8htmmqst54qdg7joa8guams", // Replace with your App Client ID
    "aws_cognito_username_attributes": [
        "EMAIL"
    ],
    "aws_cognito_signup_attributes": [
        "EMAIL",
        "NAME"
    ],
    "aws_cognito_mfa_configuration": "OFF",
    "aws_cognito_password_protection_settings": {
        "passwordPolicyMinLength": 8,
        "passwordPolicyCharacters": [
            "REQUIRES_LOWERCASE",
            "REQUIRES_UPPERCASE",
            "REQUIRES_NUMBERS",
            "REQUIRES_SYMBOLS"
        ]
    },
    "aws_cognito_verification_mechanisms": [
        "EMAIL"
    ]
};

export default awsConfig; 