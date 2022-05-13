## A selection of AWS "Machine Learning" APIs deployed as Lambda functions with the AWS CDK

This [AWS CDK](https://github.com/aws/aws-cdk) stack deploys an API Gateway with multiple endpoints served by Lambda functions. Each Lambda function calls an "Machine Learning" AWS service such as [AWS Comprehend](https://aws.amazon.com/comprehend/) and [AWS Translate](https://aws.amazon.com/translate/).

### APIs available:

1. `/translate` - AWS Translate - translate text with automatic source language detection
2. `/comprehend/sentiment` - AWS Comprehend - determine the [sentiment](https://docs.aws.amazon.com/comprehend/latest/dg/how-sentiment.html) of text
3. `/comprehend/detect-pii` - AWS Comprehend - detect [Personally Identifiable Information (PII) entities](https://docs.aws.amazon.com/comprehend/latest/dg/how-pii.html) within text
4. `/comprehend/detect-entities` - AWS Comprehend - detect [entities](https://docs.aws.amazon.com/comprehend/latest/dg/API_Entity.html) within text
5. `/comprehend/detect-key-phrases` - AWS Comprehend - detect [key phrases](https://docs.aws.amazon.com/comprehend/latest/dg/how-key-phrases.html) within text

### Useful commands:

- `npm run build` compile TypeScript to JavaScript
- `cdk deploy:staging` deploys a staging version of the stack to your default AWS account/region
- `cdk deploy:prod` deploy a production version of the stack to your default AWS account/region
