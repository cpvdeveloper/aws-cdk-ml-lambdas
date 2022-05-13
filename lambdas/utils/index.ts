import type { APIGatewayProxyResult } from "aws-lambda";

export const errorResponse = (error: any): APIGatewayProxyResult => ({
  statusCode: 400,
  body: JSON.stringify({
    data: null,
    error,
  }),
});

export const dataResponse = (data: any): APIGatewayProxyResult => ({
  statusCode: 200,
  body: JSON.stringify({
    data,
    error: null,
  }),
});
