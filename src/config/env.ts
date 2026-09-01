type AppEnv = "development" | "staging" | "production";

export const APP_ENV = import.meta.env.VITE_APP_ENV as AppEnv;

export const envConfig = (() => {
  switch (APP_ENV) {
    case "development":
      return {
        apiBaseUrl: "http://localhost:5000",
        enableDebug: true,
      };

    case "staging":
      return {
        apiBaseUrl: "https://staging-api.example.com",
        enableDebug: true,
      };

    case "production":
      return {
        apiBaseUrl: "https://api.example.com",
        enableDebug: false,
      };

    default:
      throw new Error(`Unknown VITE_APP_ENV: ${APP_ENV}`);
  }
})();

export const isDevOrStaging =
  APP_ENV === "development" || APP_ENV === "staging";
