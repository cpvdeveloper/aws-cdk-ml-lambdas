import {
  ComprehendClient,
  ContainsPiiEntitiesCommand,
} from "@aws-sdk/client-comprehend";
import { ProxyHandler } from "aws-lambda";
import { errorResponse, dataResponse } from "../utils";

const client = new ComprehendClient({
  region: process.env.AWS_REGION,
});

export const handler: ProxyHandler = async (event) => {
  try {
    const eventBody = event.body ? JSON.parse(event.body) : null;
    const sourceText = eventBody?.text;

    if (!sourceText) {
      return errorResponse({
        message: "Missing source text.",
      });
    }

    const command = new ContainsPiiEntitiesCommand({
      Text: sourceText,
      LanguageCode: "en",
    });
    const { Labels } = await client.send(command);
    return dataResponse({
      Labels,
    });
  } catch (error) {
    return errorResponse(error);
  }
};
