import { getErrorMessage } from "@/utils/error/error.util";
import {
  getRecaptchaClient,
  getRecaptchaSiteKey,
  hasRecaptchaSiteKey,
} from "@/utils/recaptcha/recaptcha.util";
import { useEffect, useRef, useState } from "react";

const RECAPTCHA_WIDTH = 304;
const RECAPTCHA_HEIGHT = 78;
const RECAPTCHA_DESKTOP_FILL_RATIO = 0.9;
const RECAPTCHA_MAX_SCALE = 1.2;

type RecaptchaChallengeProps = {
  onTokenChange: (token: string) => void;
  resetSignal: number;
};

export default function RecaptchaChallenge({
  onTokenChange,
  resetSignal,
}: RecaptchaChallengeProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<number | null>(null);
  const previousResetSignalRef = useRef(resetSignal);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const getLiveContainer = () => {
    const container = containerRef.current;
    if (!container) return null;
    if (!document.body.contains(container)) return null;
    return container;
  };

  useEffect(() => {
    const updateScale = () => {
      if (!shellRef.current) return;

      const availableWidth = shellRef.current.clientWidth;

      if (!availableWidth) return;

      const targetWidth =
        availableWidth > RECAPTCHA_WIDTH
          ? availableWidth * RECAPTCHA_DESKTOP_FILL_RATIO
          : availableWidth;

      setScale(Math.min(targetWidth / RECAPTCHA_WIDTH, RECAPTCHA_MAX_SCALE));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (shellRef.current) {
      resizeObserver.observe(shellRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const renderWidget = async () => {
      if (!hasRecaptchaSiteKey()) {
        setError(
          "reCAPTCHA is not configured. Set VITE_RECAPTCHA_SITE_KEY first.",
        );
        return;
      }

      try {
        const client = await getRecaptchaClient();

        if (cancelled || !getLiveContainer()) return;

        client.ready(() => {
          const liveContainer = getLiveContainer();

          if (
            cancelled ||
            !liveContainer ||
            widgetIdRef.current !== null
          )
            return;

          liveContainer.replaceChildren();

          widgetIdRef.current = client.render(liveContainer, {
            callback: (token) => {
              setError(null);
              onTokenChange(token);
            },
            "error-callback": () => {
              onTokenChange("");
              setError(
                "reCAPTCHA could not load. Please refresh and try again.",
              );
            },
            "expired-callback": () => {
              onTokenChange("");
              setError("reCAPTCHA expired. Please complete it again.");
              if (widgetIdRef.current !== null) {
                client.reset(widgetIdRef.current);
              }
            },
            sitekey: getRecaptchaSiteKey(),
            theme: "light",
          });
        });
      } catch (renderError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              renderError,
              "reCAPTCHA could not load. Please refresh and try again.",
            ),
          );
        }
      }
    };

    void renderWidget();

    return () => {
      cancelled = true;
      widgetIdRef.current = null;
      const liveContainer = containerRef.current;
      if (liveContainer) {
        liveContainer.replaceChildren();
      }
    };
  }, [onTokenChange]);

  useEffect(() => {
    if (previousResetSignalRef.current === resetSignal) return;

    previousResetSignalRef.current = resetSignal;
    onTokenChange("");

    let cancelled = false;

    const resetWidget = async () => {
      if (widgetIdRef.current === null) return;

      try {
        const client = await getRecaptchaClient();

        if (cancelled || widgetIdRef.current === null) return;

        client.reset(widgetIdRef.current);
        setError(null);
      } catch (resetError) {
        if (!cancelled) {
          setError(
            getErrorMessage(
              resetError,
              "reCAPTCHA could not reset. Please refresh and try again.",
            ),
          );
        }
      }
    };

    void resetWidget();

    return () => {
      cancelled = true;
    };
  }, [onTokenChange, resetSignal]);

  return (
    <div className="space-y-2">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <div ref={shellRef} className="w-full">
          <div
            className="mx-auto"
            style={{
              height: `${RECAPTCHA_HEIGHT * scale}px`,
              width: `${RECAPTCHA_WIDTH * scale}px`,
            }}
          >
            <div
              style={{
                height: `${RECAPTCHA_HEIGHT}px`,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: `${RECAPTCHA_WIDTH}px`,
              }}
            >
              <div
                className="min-h-19.5 w-76"
                ref={containerRef}
              />
            </div>
          </div>
        </div>
      </div>
      {error ? (
        <p className="text-center text-xs font-semibold text-red-500">
          {error}
        </p>
      ) : null}
    </div>
  );
}
