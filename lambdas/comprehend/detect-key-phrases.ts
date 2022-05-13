import {
  ComprehendClient,
  DetectKeyPhrasesCommand,
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

    if (!sourceText) {
      return errorResponse({
        message: "Missing source text.",
      });
    }

    const command = new DetectKeyPhrasesCommand({
      Text: sourceText,
      LanguageCode: languageCode || "en",
    });
    const { KeyPhrases } = await client.send(command);
    return dataResponse({
      KeyPhrases,
    });
  } catch (error) {
    return errorResponse(error);
  }
};
