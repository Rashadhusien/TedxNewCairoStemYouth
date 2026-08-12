import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { RequestError, ValidationError, DatabaseError } from "../http-errors";
import logger from "../logger";

export type ResponseType = "api" | "server";

const formatResponse = (
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
) => {
  const responseContent = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === "api"
    ? NextResponse.json(responseContent, { status })
    : { status, ...responseContent };
};

const handleError = (error: unknown, responseType: ResponseType = "server") => {
  if (error instanceof RequestError) {
    logger.error(
      { err: error },
      `${responseType.toUpperCase()} Error: ${error.message}`,
    );
    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors,
    );
  }
  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.flatten().fieldErrors as Record<string, string[]>,
    );
    logger.error({ err: error }, `ValidationError: ${validationError.message}`);
    return formatResponse(
      responseType,
      validationError.statusCode,
      validationError.message,
      validationError.errors,
    );
  }

  // Detect database errors and sanitize them for users
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Check for database-related error patterns
    const isDatabaseError =
      errorMessage.includes("duplicate key") ||
      errorMessage.includes("unique constraint") ||
      errorMessage.includes("foreign key constraint") ||
      errorMessage.includes("null value") ||
      errorMessage.includes("column") ||
      errorMessage.includes("relation") ||
      errorMessage.includes("syntax error") ||
      errorMessage.includes("insert into") ||
      errorMessage.includes("update") ||
      errorMessage.includes("delete from") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("database") ||
      errorMessage.includes("sql") ||
      errorMessage.includes("query");

    if (isDatabaseError) {
      // Log the full error for debugging
      logger.error(
        {
          err: error,
          stack: error.stack,
          name: error.name,
        },
        `Database Error: ${error.message}`,
      );

      // Return a sanitized message to users
      const dbError = new DatabaseError(
        "Unable to process your request. Please try again or contact support if the issue persists.",
      );
      return formatResponse(
        responseType,
        dbError.statusCode,
        dbError.message,
        dbError.errors,
      );
    }

    // For other errors, log and return the message
    logger.error(
      {
        err: error,
        stack: error.stack,
        name: error.name,
      },
      `Error: ${error.message}`,
    );
    return formatResponse(responseType, 500, error.message);
  }

  // Unknown error type
  logger.error({ err: error }, "An unexpected error occurred");
  return formatResponse(responseType, 500, "An unexpected error occurred");
};

export default handleError;
