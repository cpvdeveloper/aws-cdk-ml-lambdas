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
import { LambdaStack } from "./lambda-stack";

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

    // PII detection lambda
    const detectPiiLambda = new NodejsFunction(
      this,
      `${deploymentEnvironment}-detectPii`,
      {
        entry: join(lambdasDirectory, "comprehend", "contains-pii.ts"),
        ...nodeJsFunctionProps,
      }
    );
    const detectPiiPolicy = new PolicyStatement({
      actions: ["comprehend:ContainsPiiEntities"],
      resources: ["*"],
    });
    detectPiiLambda.role?.attachInlinePolicy(
      new Policy(this, "detect-pii-policy", {
        statements: [detectPiiPolicy],
      })
    );

    // Entities detection lambda
    const detectEntitiesLambda = new NodejsFunction(
      this,
      `${deploymentEnvironment}-detectEntities`,
      {
        entry: join(lambdasDirectory, "comprehend", "detect-entities.ts"),
        ...nodeJsFunctionProps,
      }
    );
    const detectEntitiesPolicy = new PolicyStatement({
      actions: ["comprehend:DetectEntities"],
      resources: ["*"],
    });
    detectEntitiesLambda.role?.attachInlinePolicy(
      new Policy(this, "detect-entities-policy", {
        statements: [detectEntitiesPolicy],
      })
    );

    // Key phrases detection lambda
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
      .addResource("contains-pii")
      .addMethod("POST", detectPiiIntegration);
    comprehendResource
      .addResource("detect-entities")
      .addMethod("POST", detectEntitiesIntegration);
    comprehendResource
      .addResource("detect-key-phrases")
      .addMethod("POST", detectKeyPhrasesIntegration);
  }
}
