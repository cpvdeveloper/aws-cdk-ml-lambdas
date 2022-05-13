import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import { ProxyHandler } from "aws-lambda";
import { errorResponse, dataResponse } from "../utils";

const client = new TranslateClient({
  region: process.env.AWS_REGION,
});

export const handler: ProxyHandler = async (event) => {
  try {
    const eventBody = event.body ? JSON.parse(event.body) : null;
    const sourceText = eventBody?.text;

    if (!sourceText) {
      return errorResponse({
        message: "No source text input found.",
      });
    }

    const sourceLanguageCode = eventBody?.sourceLanguageCode;
    const targetLanguageCode = eventBody?.targetLanguageCode;
    const command = new TranslateTextCommand({
      Text: sourceText,
      SourceLanguageCode: sourceLanguageCode || "auto",
      TargetLanguageCode: targetLanguageCode || "en",
    });
    const { SourceLanguageCode, TargetLanguageCode, TranslatedText } =
      await client.send(command);
    return dataResponse({
      SourceLanguageCode,
      TargetLanguageCode,
      TranslatedText,
    });
  } catch (error) {
    return errorResponse(error);
  }
};
