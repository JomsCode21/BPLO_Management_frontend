import LegalDocumentPage from "@/components/general/LegalDocumentPage";

const privacySections = [
  {
    title: "1. Information We Collect",
    content: [
      "We collect personal and business information necessary to process permit applications, verify identity, and communicate application updates.",
      "This may include your name, email address, contact details, and submitted business documents.",
    ],
  },
  {
    title: "2. How We Use Information",
    content: [
      "Collected information is used to evaluate permit applications, maintain records, and deliver notices related to your transactions.",
      "We may also use limited technical data to improve platform reliability and security.",
    ],
  },
  {
    title: "3. Data Protection",
    content: [
      "BPLO applies administrative, technical, and organizational safeguards to protect personal data from unauthorized access, loss, or misuse.",
      "Access to sensitive records is limited to authorized personnel and systems.",
    ],
  },
  {
    title: "4. Data Sharing",
    content: [
      "Your information is not sold to third parties. Data may only be shared when required by law, regulation, or legitimate government process.",
      "Service providers supporting system operations are required to follow confidentiality and security obligations.",
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      "You may request access, correction, or clarification regarding your personal data, subject to applicable legal and administrative requirements.",
      "For privacy concerns, contact BPLO through official support channels.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      subtitle="Learn how BPLO collects, uses, and protects your personal information."
      lastUpdated="March 11, 2026"
      sections={privacySections}
    />
  );
}
