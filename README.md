# Backend

API Gateway (with Cognito Auth) + Lambda + DynamoDB, S3.

* [DynamoDB SDK for JavaScript (v3)](https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html)
* [S3 SDK for JavaScript (v3)](https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html)

# API Gateway (with Cognito Auth)
[Integrating the REST API with the Amazon Cognito user pool](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/apigateway-enable-cognito-user-pool.html)
[Cognito info Mapping](https://docs.aws.amazon.com/ja_jp/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html)

# Lambda
cognito info can get following.

```js
event.context.email  // cognito user's email
event.context.sub  // cognito user's id
```

[new Error](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/typescript-exceptions.html)

# DynamoDB
* [Query Description](https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/GettingStarted.Query.html)
  * [Query Docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-lib-dynamodb/Class/QueryCommand/)

# S3

