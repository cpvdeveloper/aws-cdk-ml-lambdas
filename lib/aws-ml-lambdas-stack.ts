import { Stack, StackProps } from "aws-cdk-lib";
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import type { DeploymentEnvironmentProps } from "../types";
import { LambdaStack } from "./lambda-stack";

interface AwsMlLambdasStackProps
  extends StackProps,
    DeploymentEnvironmentProps {}

/**
 * Deploys an API Gateway with multiple endpoints served by Lambda functions.
 */
export class AwsMlLambdasStack extends Stack {
  constructor(scope: Construct, id: string, props?: AwsMlLambdasStackProps) {
    super(scope, id, props);

    const deploymentEnvironment = props?.deploymentEnvironment || "staging";

    const { lambdaFunction: translateTextLambda } = new LambdaStack(
      this,
      "translateTextLambdaStack",
      {
        deploymentEnvironment,
        lambdaFilePath: "translate/index.ts",
        lambdaFunctionName: "translateText",
        policyActions: [
          "translate:TranslateText",
          "comprehend:DetectDominantLanguage",
        ],
        policyName: "translate-text-policy",
      }
    );

    const { lambdaFunction: detectSentimentLambda } = new LambdaStack(
      this,
      "detectSentimentLambdaStack",
      {
        deploymentEnvironment,
        lambdaFilePath: "comprehend/sentiment.ts",
        lambdaFunctionName: "detectSentiment",
        policyActions: ["comprehend:DetectSentiment"],
        policyName: "detect-sentiment-policy",
      }
    );

    const { lambdaFunction: detectPiiLambda } = new LambdaStack(
      this,
      "detectPiiLambdaStack",
      {
        deploymentEnvironment,
        lambdaFilePath: "comprehend/contains-pii.ts",
        lambdaFunctionName: "detectPii",
        policyActions: ["comprehend:ContainsPiiEntities"],
        policyName: "detect-pii-policy",
      }
    );

    const { lambdaFunction: detectEntitiesLambda } = new LambdaStack(
      this,
      "detectEntitiesLambdaStack",
      {
        deploymentEnvironment,
        lambdaFilePath: "comprehend/detect-entities.ts",
        lambdaFunctionName: "detectEntities",
        policyActions: ["comprehend:DetectEntities"],
        policyName: "detect-entities-policy",
      }
    );

    const { lambdaFunction: detectKeyPhrasesLambda } = new LambdaStack(
      this,
      "keyPhrasesLambdaStack",
      {
        deploymentEnvironment,
        lambdaFilePath: "comprehend/detect-key-phrases.ts",
        lambdaFunctionName: "detectKeyPhrases",
        policyActions: ["comprehend:DetectKeyPhrases"],
        policyName: "detect-key-phrases-policy",
      }
    );

    // Create an API Gateway
    const api = new RestApi(this, "awsMlApi", {
      restApiName: `AWS ML Service ${deploymentEnvironment
        .charAt(0)
        .toUpperCase()}${deploymentEnvironment.slice(1)}`,
      deployOptions: {
        stageName: deploymentEnvironment,
      },
    });

    const translateTextIntegration = new LambdaIntegration(translateTextLambda);
    const detectSentimentIntegration = new LambdaIntegration(
      detectSentimentLambda
    );
    const detectPiiIntegration = new LambdaIntegration(detectPiiLambda);
    const detectEntitiesIntegration = new LambdaIntegration(
      detectEntitiesLambda
    );
    const detectKeyPhrasesIntegration = new LambdaIntegration(
      detectKeyPhrasesLambda
    );

    api.root
      .addResource("translate")
      .addMethod("POST", translateTextIntegration);

    const comprehendResource = api.root.addResource("comprehend");
    comprehendResource
      .addResource("sentiment")
      .addMethod("POST", detectSentimentIntegration);
    comprehendResource
      .addResource("detect-pii")
      .addMethod("POST", detectPiiIntegration);
    comprehendResource
      .addResource("detect-entities")
      .addMethod("POST", detectEntitiesIntegration);
    comprehendResource
      .addResource("detect-key-phrases")
      .addMethod("POST", detectKeyPhrasesIntegration);
  }
}
