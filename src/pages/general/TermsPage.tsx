import LegalDocumentPage from "@/components/general/LegalDocumentPage";

const termsSections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By creating an account and using the BPLO Online Business Permit System, you agree to follow these Terms and Conditions and all related laws and regulations.",
      "If you do not agree with any part of these terms, you should not use this service.",
    ],
  },
  {
    title: "2. Account Responsibility",
    content: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities made through your account.",
      "You must provide accurate, current, and complete registration information and keep it updated.",
    ],
  },
  {
    title: "3. Proper Use of the Platform",
    content: [
      "You agree to use the platform only for lawful business permit applications, renewals, and related transactions.",
      "Any attempt to misuse, disrupt, or gain unauthorized access to the system may result in account suspension and legal action.",
    ],
  },
  {
    title: "4. Changes to Services",
    content: [
      "BPLO may update, modify, or discontinue features of the system at any time to improve service quality, security, and compliance.",
      "We may also update these terms, and continued use of the platform means you accept those updates.",
    ],
  },
  {
    title: "5. Contact",
    content: [
      "For questions regarding these terms, please contact the BPLO support office through official communication channels.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms and Conditions"
      subtitle="Please review the rules and responsibilities for using the BPLO online services."
      lastUpdated="March 11, 2026"
      sections={termsSections}
    />
  );
}
