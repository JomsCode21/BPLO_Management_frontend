export const getHttpStatusCode = (error: unknown): number | null => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response &&
    typeof error.response.status === "number"
  ) {
    return error.response.status;
  }

  return null;
};

export const isNotModifiedHttpError = (error: unknown) =>
  getHttpStatusCode(error) === 304;
