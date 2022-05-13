## A selection of AWS "Machine Learning" APIs deployed as lambda functions + API Gateway using the AWS CDK.

### APIs available:

1. AWS Translate - translate text with automatic source language detection
2. AWS Comprehend - determine the [sentiment](https://docs.aws.amazon.com/comprehend/latest/dg/how-sentiment.html) of text
3. AWS Comprehend - detect [Personally Identifiable Information (PII) entities](https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html) within text
4. AWS Comprehend - detect [entities](https://docs.aws.amazon.com/comprehend/latest/dg/API_Entity.html) within text
5. AWS Comprehend - detect [key phrases](https://docs.aws.amazon.com/comprehend/latest/dg/how-key-phrases.html) within text

### Useful commands:

- `npm run build` compile typescript to js
- `cdk deploy:staging` deploys a staging version of the stack to your default AWS account/region
- `cdk deploy:prod` deploy a production version of the stack to your default AWS account/region
