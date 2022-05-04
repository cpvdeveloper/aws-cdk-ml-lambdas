import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";
import { ProxyHandler } from "aws-lambda";

const client = new TranslateClient({
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
            message: "No source text input found.",
          },
        }),
      };
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
    return {
      statusCode: 200,
      body: JSON.stringify({
        data: {
          SourceLanguageCode,
          TargetLanguageCode,
          TranslatedText,
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
