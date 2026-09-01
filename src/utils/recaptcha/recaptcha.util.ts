const RECAPTCHA_SCRIPT_ID = "google-recaptcha-v2";
const RECAPTCHA_SCRIPT_URL =
  "https://www.google.com/recaptcha/api.js?render=explicit";

type RecaptchaRenderOptions = {
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  sitekey: string;
  size?: "compact" | "normal";
  theme?: "dark" | "light";
};

type RecaptchaClient = {
  ready: (callback: () => void) => void;
  render: (
    container: HTMLElement | string,
    options: RecaptchaRenderOptions,
  ) => number;
  reset: (widgetId?: number) => void;
};

type RecaptchaWindow = Window &
  typeof globalThis & { grecaptcha?: RecaptchaClient };

let scriptLoadPromise: Promise<void> | null = null;

export const getRecaptchaSiteKey = () => {
  const siteKey = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();

  if (!siteKey) {
    throw new Error(
      "reCAPTCHA is not configured. Set VITE_RECAPTCHA_SITE_KEY in the frontend environment.",
    );
  }

  return siteKey;
};

const loadRecaptchaScript = async () => {
  const existingClient = (window as RecaptchaWindow).grecaptcha;
  if (existingClient) return;

  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById(
        RECAPTCHA_SCRIPT_ID,
      ) as HTMLScriptElement | null;

      const handleLoad = () => resolve();
      const handleError = () => {
        scriptLoadPromise = null;
        reject(new Error("Failed to load reCAPTCHA. Please try again."));
      };

      if (existingScript) {
        existingScript.addEventListener("load", handleLoad, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
        return;
      }

      getRecaptchaSiteKey();

      const script = document.createElement("script");

      script.id = RECAPTCHA_SCRIPT_ID;
      script.src = RECAPTCHA_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });

      document.head.append(script);
    });
  }

  await scriptLoadPromise;
};

export const getRecaptchaClient = async () => {
  await loadRecaptchaScript();

  const client = (window as RecaptchaWindow).grecaptcha;

  if (!client) {
    throw new Error(
      "reCAPTCHA did not finish loading. Please refresh the page and try again.",
    );
  }

  return client;
};

export const hasRecaptchaSiteKey = () =>
  Boolean(String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim());

export const preloadRecaptcha = async () => {
  await getRecaptchaClient();
};

export const requireRecaptchaToken = (token: string) => {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    throw new Error("Please complete the reCAPTCHA challenge.");
  }

  return trimmedToken;
};
