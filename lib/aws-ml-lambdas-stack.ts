import { Stack, StackProps } from "aws-cdk-lib";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";

export class AwsMlLambdasStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdasDirectory = join(__dirname, "..", "lambdas");

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      depsLockFilePath: join(lambdasDirectory, "package-lock.json"),
      environment: {
        AWS_REGION: process.env.AWS_REGION as string,
      },
      runtime: Runtime.NODEJS_14_X,
    };

    const translateTextLambda = new NodejsFunction(this, "translateText", {
      entry: join(lambdasDirectory, "translate", "index.ts"),
      ...nodeJsFunctionProps,
    });

    const detectSentimentLambda = new NodejsFunction(this, "detectSentiment", {
      entry: join(lambdasDirectory, "comprehend", "sentiment.ts"),
      ...nodeJsFunctionProps,
    });

    const translateTextIntegration = new LambdaIntegration(translateTextLambda);
    const detectSentimentIntegration = new LambdaIntegration(
      detectSentimentLambda
    );

    const api = new RestApi(this, "awsMlApi", {
      restApiName: "AWS ML Service",
    });

    api.root
      .addResource("translate")
      .addMethod("POST", translateTextIntegration);

    api.root
      .addResource("comprehend")
      .addResource("sentiment")
      .addMethod("POST", detectSentimentIntegration);
  }
}
