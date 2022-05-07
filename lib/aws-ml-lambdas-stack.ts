import { Stack, StackProps } from "aws-cdk-lib";
import { PolicyStatement, Policy } from "aws-cdk-lib/aws-iam";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { join } from "path";
import type { DeploymentEnvironmentProps } from "../types";

interface AwsMlLambdasStackProps
  extends StackProps,
    DeploymentEnvironmentProps {}

export class AwsMlLambdasStack extends Stack {
  constructor(scope: Construct, id: string, props?: AwsMlLambdasStackProps) {
    super(scope, id, props);

    const lambdasDirectory = join(__dirname, "..", "lambdas");
    const deploymentEnvironment = props?.deploymentEnvironment || "staging";

    // Base props for all lambdas
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

    // Translate text lambda function
    const translateTextLambda = new NodejsFunction(
      this,
      `${deploymentEnvironment}-translateText`,
      {
        entry: join(lambdasDirectory, "translate", "index.ts"),
        ...nodeJsFunctionProps,
      }
    );
    const translateTextPolicy = new PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });
    const detectLanguagePolicy = new PolicyStatement({
      actions: ["comprehend:DetectDominantLanguage"],
      resources: ["*"],
    });
    translateTextLambda.role?.attachInlinePolicy(
      new Policy(this, "translate-text-policy", {
        statements: [detectLanguagePolicy, translateTextPolicy],
      })
    );

    // Sentiment detection lambda
    const detectSentimentLambda = new NodejsFunction(
      this,
      `${deploymentEnvironment}-detectSentiment`,
      {
        entry: join(lambdasDirectory, "comprehend", "sentiment.ts"),
        ...nodeJsFunctionProps,
      }
    );
    const detectSentimentPolicy = new PolicyStatement({
      actions: ["comprehend:DetectSentiment"],
      resources: ["*"],
    });
    detectSentimentLambda.role?.attachInlinePolicy(
      new Policy(this, "detect-sentiment-policy", {
        statements: [detectSentimentPolicy],
      })
    );

    // Create an API Gateway
    const api = new RestApi(this, `${deploymentEnvironment}-awsMlApi`, {
      restApiName: "AWS ML Service",
      deployOptions: {
        stageName: deploymentEnvironment,
      },
    });

    const translateTextIntegration = new LambdaIntegration(translateTextLambda);
    const detectSentimentIntegration = new LambdaIntegration(
      detectSentimentLambda
    );

    api.root
      .addResource("translate")
      .addMethod("POST", translateTextIntegration);

    api.root
      .addResource("comprehend")
      .addResource("sentiment")
      .addMethod("POST", detectSentimentIntegration);
  }
}
