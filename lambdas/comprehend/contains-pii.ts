import {
  ComprehendClient,
  ContainsPiiEntitiesCommand,
} from "@aws-sdk/client-comprehend";
import { ProxyHandler } from "aws-lambda";

const client = new ComprehendClient({
  region: process.env.AWS_REGION,
});

export const handler: ProxyHandler = async (event) => {
  try {
    const eventBody = event.body ? JSON.parse(event.body) : null;
    const sourceText = eventBody?.text;

    if (!sourceText) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          data: null,
          error: {
            message: "Missing source text.",
          },
        }),
      };
    }

    const command = new ContainsPiiEntitiesCommand({
      Text: sourceText,
      LanguageCode: "en",
    });
    const { Labels } = await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: {
          Labels,
        },
        error: null,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        data: null,
        error,
      }),
    };
  }
};
