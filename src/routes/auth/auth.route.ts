// Libraries
import React from "react";
import type { RouteObject } from "react-router-dom";
// Layouts
import AuthLayout from "@/layouts/auth/AuthLayout";

const createLazyRouteComponent = <T extends React.ComponentType<object>>(
  importer: () => Promise<{ default: T }>,
) => {
  const LazyComponent = React.lazy(importer);

  return (props: React.ComponentProps<T>) =>
    React.createElement(
      LazyComponent,
      props as React.ComponentProps<typeof LazyComponent>,
    );
};

const ForgotPasswordPage = createLazyRouteComponent(
  () => import("@/pages/auth/forgot-password/ForgotPasswordPage"),
);
const OtpVerificationPage = createLazyRouteComponent(
  () => import("@/pages/auth/forgot-password/OtpVerificationPage"),
);
const ResetPasswordPage = createLazyRouteComponent(
  () => import("@/pages/auth/forgot-password/ResetPasswordPage"),
);
const LoginPage = createLazyRouteComponent(
  () => import("@/pages/auth/login/LoginPage"),
);
const RegisterPage = createLazyRouteComponent(
  () => import("@/pages/auth/register/RegisterPage"),
);
const RegistrationOtpPage = createLazyRouteComponent(
  () => import("@/pages/auth/register/RegistrationOtpPage"),
);
const LandingPage = createLazyRouteComponent(
  () => import("@/pages/general/LandingPage"),
);
const PrivacyPolicyPage = createLazyRouteComponent(
  () => import("@/pages/general/PrivacyPolicyPage"),
);
const TermsPage = createLazyRouteComponent(
  () => import("@/pages/general/TermsPage"),
);

export const authRoutes: RouteObject = {
  Component: AuthLayout,
  children: [
    { index: true, Component: LandingPage },
    { path: "auth/login", Component: LoginPage },
    { path: "auth/register", Component: RegisterPage },
    { path: "auth/verify-registration", Component: RegistrationOtpPage },
    { path: "auth/forgot-password", Component: ForgotPasswordPage },
    { path: "auth/verify-otp", Component: OtpVerificationPage },
    { path: "auth/reset-password", Component: ResetPasswordPage },
    { path: "terms-and-conditions", Component: TermsPage },
    { path: "privacy-policy", Component: PrivacyPolicyPage },
  ],
};
