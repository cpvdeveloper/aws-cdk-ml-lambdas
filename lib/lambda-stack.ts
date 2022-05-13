import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement, Policy } from "aws-cdk-lib/aws-iam";
import { join } from "path";
import type { DeploymentEnvironmentProps } from "../types";

interface LambdasStackProps extends StackProps, DeploymentEnvironmentProps {
  lambdaFilePath: string;
  lambdaFunctionName: string;
  policyActions: Array<string>;
  policyName: string;
}

/**
 * Deploys a Lambda function with with permissions.
 */
export class LambdaStack extends Construct {
  public readonly nodeJsFunctionProps: NodejsFunctionProps;
  public readonly lambdasDirectory: string;
  public readonly lambdaFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props?: LambdasStackProps) {
    super(scope, id);

    this.lambdasDirectory = join(__dirname, "..", "lambdas");

    // Base props for all lambdas
    this.nodeJsFunctionProps = {
      bundling: {
        externalModules: ["aws-sdk"],
      },
      depsLockFilePath: join(this.lambdasDirectory, "package-lock.json"),
      environment: {
        AWS_REGION: process.env.AWS_REGION as string,
      },
      runtime: Runtime.NODEJS_14_X,
    };

    this.lambdaFunction = this.createLambdaFunction({
      functionId: `${props?.deploymentEnvironment}-${props?.lambdaFunctionName}`,
      filePath: props?.lambdaFilePath as string,
      policyActions: props?.policyActions as Array<string>,
      policyName: props?.policyName as string,
    });
  }

  private createLambdaFunction({
    functionId,
    filePath,
    policyActions,
    policyName,
  }: {
    functionId: string;
    filePath: string;
    policyActions: Array<string>;
    policyName: string;
  }) {
    const lambdaFunction = new NodejsFunction(this, functionId, {
      entry: join(this.lambdasDirectory, filePath),
      ...this.nodeJsFunctionProps,
    });

    const policies = policyActions?.map(
      (action) =>
        new PolicyStatement({
          actions: [action],
          resources: ["*"],
        })
    );

    lambdaFunction.role?.attachInlinePolicy(
      new Policy(this, policyName as string, {
        statements: policies,
      })
    );

    return lambdaFunction;
  }
}
