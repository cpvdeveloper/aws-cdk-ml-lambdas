import {
  ComprehendClient,
  DetectSentimentCommand,
} from "@aws-sdk/client-comprehend";
import { ProxyHandler } from "aws-lambda";

const client = new ComprehendClient({
  region: process.env.AWS_REGION,
});

export const handler: ProxyHandler = async (event) => {
  try {
    const eventBody = event.body ? JSON.parse(event.body) : null;
    const sourceText = eventBody?.text;
    const languageCode = eventBody?.languageCode;

    if (!sourceText || !languageCode) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          data: null,
          error: {
            message: "Missing source text or language code.",
          },
        }),
      };
    }

    const command = new DetectSentimentCommand({
      Text: sourceText,
      LanguageCode: languageCode || "auto",
    });
    const { Sentiment, SentimentScore } = await client.send(command);
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: {
          Sentiment,
          SentimentScore,
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
