export type DeploymentEnvironment = "staging" | "prod";

export interface DeploymentEnvironmentProps {
  deploymentEnvironment: DeploymentEnvironment;
}
