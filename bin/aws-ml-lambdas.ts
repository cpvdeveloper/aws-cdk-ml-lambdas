#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsMlLambdasStack } from "../lib/aws-ml-lambdas-stack";
import { DeploymentEnvironment } from "../types";

const app = new cdk.App();
const deploymentEnvironment: DeploymentEnvironment =
  app.node.tryGetContext("stage") || "staging";

new AwsMlLambdasStack(app, `${deploymentEnvironment}-AwsMlLambdasStack`, {
  deploymentEnvironment,
});
