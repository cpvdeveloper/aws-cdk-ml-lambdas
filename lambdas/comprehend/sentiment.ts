import {
  ComprehendClient,
  DetectSentimentCommand,
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
    const languageCode = eventBody?.languageCode;

    if (!sourceText || !languageCode) {
      return errorResponse({
        message: "Missing source text or language code.",
      });
    }

    const command = new DetectSentimentCommand({
      Text: sourceText,
      LanguageCode: languageCode || "auto",
    });
    const { Sentiment, SentimentScore } = await client.send(command);
    return dataResponse({
      Sentiment,
      SentimentScore,
    });
  } catch (error) {
    return errorResponse(error);
  }
};
