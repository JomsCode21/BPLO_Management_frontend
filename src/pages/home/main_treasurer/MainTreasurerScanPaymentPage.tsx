import {
  confirmMainTreasurerPaymentReceiptApi,
  getMainTreasurerPaymentsApi,
} from "@/api/treasurer/treasurer.api";
import {
  createTreasurerSocket,
  MAIN_TREASURER_PAYMENT_EVENT,
} from "@/socket/treasurer.socket";
import { MainTreasurerScanPaymentSkeleton } from "@/layouts/home/home-fallback-skeletons";
import type { MainTreasurerPaymentType } from "@/types/treasurer/treasurer.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import type QrScanner from "qr-scanner";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiCamera,
  FiCheckCircle,
  FiCreditCard,
  FiHash,
  FiLoader,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

type MainTreasurerPaymentGroupType = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  permitType: string;
  combinedQrValue: string;
  generatedAt?: string | null;
  totalAmount: number;
  paymentStatus: "pending" | "paid";
  assessments: MainTreasurerPaymentType[];
  paidCount: number;
};

type ParsedPaymentQrType = {
  rawValue: string;
  applicationId: string;
  scannedTotalLabel: string;
  isSystemIssued: boolean;
  isMalformedSystemQr: boolean;
};

type ReceiptPrintDataType = {
  receiptNumber: string;
  printedAtIso: string;
  applicationId: string;
  applicantName: string;
  permitType: string;
  assessments: Array<{ departmentName: string; amount: number }>;
  totalDue: number;
  amountReceived: number;
  change: number;
};

type QrScannerConstructor = (typeof import("qr-scanner"))["default"];

const formatCurrency = (value: number) =>
  `PHP ${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const normalizeQrAmountLabel = (value: string) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";

  const numericValue = Number(trimmed.replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numericValue)) {
    return formatCurrency(numericValue);
  }

  return trimmed;
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatReceiptDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const buildReceiptPrintHtml = (receipt: ReceiptPrintDataType) => {
  const assessmentRows = receipt.assessments
    .map(
      (assessment) => `
        <tr>
          <td>${escapeHtml(assessment.departmentName)}</td>
          <td class="right">${formatCurrency(assessment.amount)}</td>
        </tr>
      `,
    )
    .join("");

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Receipt ${escapeHtml(receipt.receiptNumber)}</title>
      <style>
        :root { color-scheme: light; }
        body {
          margin: 0;
          padding: 24px;
          font-family: "Segoe UI", Tahoma, sans-serif;
          color: #0f2942;
          background: #f5f7fb;
        }
        .sheet {
          max-width: 780px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #d9e2ec;
          border-radius: 16px;
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 22px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .meta p { margin: 2px 0; font-size: 13px; }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px 12px;
        }
        .card .label {
          display: block;
          color: #4b5563;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 700;
        }
        .card .value {
          margin-top: 6px;
          font-size: 15px;
          font-weight: 700;
          word-break: break-word;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
        }
        th, td {
          border-bottom: 1px solid #e5e7eb;
          padding: 10px 8px;
          text-align: left;
          font-size: 14px;
        }
        th {
          color: #4b5563;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .right {
          text-align: right;
          font-weight: 700;
        }
        .totals {
          margin-top: 16px;
          margin-left: auto;
          max-width: 360px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px dashed #e5e7eb;
          padding: 8px 0;
          font-size: 14px;
        }
        .totals-row strong { font-size: 15px; }
        .footer {
          margin-top: 28px;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 14px;
        }
        @media print {
          body { background: #fff; padding: 0; }
          .sheet {
            border: none;
            border-radius: 0;
            max-width: none;
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <main class="sheet">
        <section class="header">
          <div>
            <h1>Official Receipt</h1>
            <p style="margin: 6px 0 0; font-size: 13px; color: #4b5563;">
              BPLO Main Treasurer Payment Confirmation
            </p>
          </div>
          <div class="meta">
            <p><strong>Receipt No:</strong> ${escapeHtml(receipt.receiptNumber)}</p>
            <p><strong>Printed At:</strong> ${escapeHtml(formatReceiptDateTime(receipt.printedAtIso))}</p>
          </div>
        </section>
        <section class="summary-grid">
          <article class="card">
            <span class="label">Applicant</span>
            <div class="value">${escapeHtml(receipt.applicantName)}</div>
          </article>
          <article class="card">
            <span class="label">Application ID</span>
            <div class="value">${escapeHtml(receipt.applicationId)}</div>
          </article>
          <article class="card">
            <span class="label">Permit Type</span>
            <div class="value">${escapeHtml(receipt.permitType)}</div>
          </article>
          <article class="card">
            <span class="label">Paid Departments</span>
            <div class="value">${receipt.assessments.length}</div>
          </article>
        </section>
        <section>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th class="right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${assessmentRows}
            </tbody>
          </table>
        </section>
        <section class="totals">
          <div class="totals-row">
            <span>Total Due</span>
            <strong>${formatCurrency(receipt.totalDue)}</strong>
          </div>
          <div class="totals-row">
            <span>Amount Received</span>
            <strong>${formatCurrency(receipt.amountReceived)}</strong>
          </div>
          <div class="totals-row">
            <span>Change</span>
            <strong>${formatCurrency(receipt.change)}</strong>
          </div>
        </section>
        <footer class="footer">
          This receipt confirms that payment was marked as paid in the BPLO system.
        </footer>
      </main>
      <script>
        window.addEventListener("load", () => {
          window.print();
        });
      </script>
    </body>
  </html>`;
};

const STRICT_SYSTEM_PAYMENT_QR_PATTERN =
  /^BPLOPAY\|APP=([a-f0-9]{24})\|TOTAL=([0-9][0-9,]*(?:\.[0-9]{1,2})?)\|DEPTS=([1-9][0-9]*)\|SIG=([A-F0-9]{16})$/i;

// Fast shape check to provide clearer errors before strict signature validation.
const hasSystemPaymentQrShape = (value: string) => {
  const normalized = String(value ?? "").trim();
  return (
    normalized.startsWith("BPLOPAY|") &&
    normalized.includes("|APP=") &&
    normalized.includes("|TOTAL=") &&
    normalized.includes("|DEPTS=") &&
    normalized.includes("|SIG=")
  );
};

const isSystemPaymentQrValue = (value: string) =>
  STRICT_SYSTEM_PAYMENT_QR_PATTERN.test(String(value ?? "").trim());

const buildPaymentGroups = (records: MainTreasurerPaymentType[]) =>
  Array.from(
    records
      .reduce<Map<string, MainTreasurerPaymentGroupType>>((groups, record) => {
        const existing = groups.get(record.applicationId);
        const generatedAtTime = new Date(record.generatedAt ?? "").getTime();

        if (!existing) {
          groups.set(record.applicationId, {
            applicationId: record.applicationId,
            applicantName: record.applicantName,
            applicantEmail: record.applicantEmail,
            permitType: record.permitType,
            combinedQrValue: record.combinedQrValue?.trim() || "",
            generatedAt: record.generatedAt ?? null,
            totalAmount: Number(record.totalAmount ?? 0),
            paymentStatus: record.paymentStatus === "paid" ? "paid" : "pending",
            assessments: [record],
            paidCount: record.paymentStatus === "paid" ? 1 : 0,
          });
          return groups;
        }

        const existingGeneratedAtTime = new Date(
          existing.generatedAt ?? "",
        ).getTime();

        existing.assessments.push(record);
        existing.totalAmount += Number(record.totalAmount ?? 0);
        existing.paidCount += record.paymentStatus === "paid" ? 1 : 0;

        if (generatedAtTime > existingGeneratedAtTime) {
          existing.generatedAt = record.generatedAt ?? null;
        }

        if (!existing.combinedQrValue && record.combinedQrValue?.trim()) {
          existing.combinedQrValue = record.combinedQrValue.trim();
        }

        existing.paymentStatus =
          existing.paidCount === existing.assessments.length
            ? "paid"
            : "pending";

        return groups;
      }, new Map<string, MainTreasurerPaymentGroupType>())
      .values(),
  ).sort(
    (a, b) =>
      new Date(b.generatedAt ?? "").getTime() -
      new Date(a.generatedAt ?? "").getTime(),
  );

const parsePaymentQrValue = (rawValue: string): ParsedPaymentQrType => {
  const normalized = String(rawValue ?? "").trim();
  const hasSystemShape = hasSystemPaymentQrShape(normalized);
  const isSystemIssued = isSystemPaymentQrValue(normalized);
  const applicationId =
    normalized.match(/\bAPP\s*=\s*([a-f0-9]{24})\b/i)?.[1]?.trim() ?? "";
  const rawScannedTotal =
    normalized
      .match(/\bTOTAL\s*=\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)\b/i)?.[1]
      ?.trim() ?? "";

  return {
    rawValue: normalized,
    applicationId,
    scannedTotalLabel: normalizeQrAmountLabel(rawScannedTotal),
    isSystemIssued,
    isMalformedSystemQr: hasSystemShape && !isSystemIssued,
  };
};

const getCameraSupportError = async (QrScannerLib: QrScannerConstructor) => {
  if (!navigator.mediaDevices?.getUserMedia) {
    return "Camera access is not available in this browser.";
  }

  if (!window.isSecureContext) {
    return "Camera access requires HTTPS or localhost. Use the manual QR text box below.";
  }

  try {
    const hasCamera = await QrScannerLib.hasCamera();
    if (!hasCamera) {
      return "No camera was found on this device. Use the manual QR text box below.";
    }
  } catch {
    return "Camera QR scanning is unavailable right now. Use the manual QR text box below.";
  }

  return "";
};

const buildWideScanRegion = (video: HTMLVideoElement) => {
  const sourceWidth = Math.max(video.videoWidth || 0, 1);
  const sourceHeight = Math.max(video.videoHeight || 0, 1);
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));

  return {
    x: 0,
    y: 0,
    width: sourceWidth,
    height: sourceHeight,
    downScaledWidth: Math.max(1, Math.round(sourceWidth * scale)),
    downScaledHeight: Math.max(1, Math.round(sourceHeight * scale)),
  };
};

export default function MainTreasurerScanPaymentPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MainTreasurerPaymentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualQrValue, setManualQrValue] = useState("");
  const [parsedQr, setParsedQr] = useState<ParsedPaymentQrType | null>(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [latestReceipt, setLatestReceipt] = useState<ReceiptPrintDataType | null>(
    null,
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const groupedRecords = useMemo(() => buildPaymentGroups(records), [records]);
  const exactMatchedPayment = useMemo(() => {
    if (!parsedQr?.rawValue) return null;

    return (
      groupedRecords.find(
        (record) => record.combinedQrValue === parsedQr.rawValue,
      ) ?? null
    );
  }, [groupedRecords, parsedQr]);
  const matchedPayment = useMemo(() => {
    if (exactMatchedPayment) return exactMatchedPayment;
    if (!parsedQr?.applicationId) return null;

    return (
      groupedRecords.find(
        (record) => record.applicationId === parsedQr.applicationId,
      ) ?? null
    );
  }, [exactMatchedPayment, groupedRecords, parsedQr]);
  const hasExactQrMatch = !!exactMatchedPayment;
  const isOutdatedQr =
    !!parsedQr?.isSystemIssued && !!matchedPayment && !hasExactQrMatch;
  const parsedAmountReceived = useMemo(() => {
    const normalizedAmount = amountReceived.trim();

    if (!normalizedAmount) return null;

    const numericValue = Number(normalizedAmount);
    return Number.isFinite(numericValue) ? numericValue : null;
  }, [amountReceived]);
  const unpaidAssessments = useMemo(
    () =>
      matchedPayment?.assessments.filter(
        (assessment) => assessment.paymentStatus !== "paid",
      ) ?? [],
    [matchedPayment],
  );
  const remainingAmountDue = useMemo(
    () =>
      unpaidAssessments.reduce(
        (sum, assessment) => sum + Number(assessment.totalAmount ?? 0),
        0,
      ),
    [unpaidAssessments],
  );
  const hasMixedPaymentState = useMemo(
    () =>
      !!matchedPayment &&
      unpaidAssessments.length > 0 &&
      unpaidAssessments.length < matchedPayment.assessments.length,
    [matchedPayment, unpaidAssessments.length],
  );
  const liveChangeDue = useMemo(() => {
    if (
      !matchedPayment ||
      parsedAmountReceived === null ||
      parsedAmountReceived < 0
    ) {
      return null;
    }

    return parsedAmountReceived - remainingAmountDue;
  }, [matchedPayment, parsedAmountReceived, remainingAmountDue]);

  const loadRecords = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getMainTreasurerPaymentsApi();
      setRecords(response.data ?? []);
      if (isSilent) {
        setError(null);
      }
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ?? "Failed to load payment records.",
        );
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    }
  };

  const stopCamera = () => {
    scannerRef.current?.destroy();
    scannerRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsScanning(false);
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  useEffect(() => {
    const socket = createTreasurerSocket();
    socket.on(MAIN_TREASURER_PAYMENT_EVENT, () => {
      void loadRecords({ silent: true });
    });

    return () => {
      socket.off(MAIN_TREASURER_PAYMENT_EVENT);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!parsedQr?.rawValue) return;

    if (parsedQr.isMalformedSystemQr) {
      setScannerError(
        "This BPLO payment QR is incomplete or corrupted. Ask the owner for the latest payment QR.",
      );
      return;
    }

    if (!parsedQr.isSystemIssued) {
      setScannerError("Only BPLO-generated payment QR codes are accepted.");
      return;
    }

    if (!parsedQr.applicationId) {
      setScannerError(
        "The scanned BPLO QR is missing its application reference. Please rescan the owner QR.",
      );
      return;
    }

    if (isOutdatedQr) {
      setScannerError(
        "This BPLO QR belongs to a listed application, but it is no longer the current treasurer QR. Ask the owner for the latest payment QR.",
      );
      return;
    }

    if (!matchedPayment) {
      setScannerError(
        "This application is not currently in the active main treasurer payment list. It may already be paid, completed, or generated from an older payment state.",
      );
      return;
    }
    if (matchedPayment.paymentStatus === "paid") {
      setScannerError(
        "This QR is already paid. Scanning it again is not allowed.",
      );
      return;
    }

    setScannerError(null);
  }, [isOutdatedQr, matchedPayment, parsedQr]);

  const resolveQrValue = (rawValue: string) => {
    const parsed = parsePaymentQrValue(rawValue);
    const immediateMatch =
      groupedRecords.find((record) => record.combinedQrValue === parsed.rawValue) ??
      groupedRecords.find(
        (record) => record.applicationId === parsed.applicationId,
      ) ??
      null;

    setManualQrValue(parsed.rawValue);
    setAmountReceived("");
    setSuccessMessage(null);
    setLatestReceipt(null);
    setParsedQr(parsed);
    stopCamera();

    if (parsed.isMalformedSystemQr) {
      setScannerError(
        "This BPLO payment QR is incomplete or corrupted. Ask the owner for the latest payment QR.",
      );
      return;
    }

    if (!parsed.isSystemIssued) {
      setScannerError("Only BPLO-generated payment QR codes are accepted.");
      return;
    }

    if (!parsed.applicationId) {
      setScannerError(
        "The scanned BPLO QR is missing its application reference. Please rescan the owner QR.",
      );
      return;
    }
    if (immediateMatch?.paymentStatus === "paid") {
      setScannerError("This QR is already paid. Scanning it again is not allowed.");
      return;
    }

    setScannerError(null);
  };

  const startCamera = async () => {
    setIsStartingCamera(true);
    setScannerError(null);

    try {
      stopCamera();

      const { default: QrScannerLib } = await import("qr-scanner");
      const supportError = await getCameraSupportError(QrScannerLib);
      if (supportError) {
        setScannerError(supportError);
        return;
      }

      const video = videoRef.current;
      if (!video) {
        setScannerError("Scanner video preview is not available.");
        return;
      }

      scannerRef.current = new QrScannerLib(
        video,
        (result) => {
          resolveQrValue(result.data);
        },
        {
          onDecodeError: () => {
            // Ignore frame-by-frame misses and keep the scanner running.
          },
          preferredCamera: "environment",
          maxScansPerSecond: 25,
          calculateScanRegion: buildWideScanRegion,
          highlightScanRegion: false,
          highlightCodeOutline: false,
          returnDetailedScanResult: true,
        },
      );

      scannerRef.current.setInversionMode("both");
      await scannerRef.current.start();
      setIsScanning(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unable to open the camera for QR scanning.";
      setScannerError(message);
      stopCamera();
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleManualQrSubmit = () => {
    if (!manualQrValue.trim()) {
      setScannerError("Paste the full BPLO payment QR text first.");
      return;
    }

    resolveQrValue(manualQrValue);
  };

  const handleReceivePayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!matchedPayment || !parsedQr?.rawValue) {
      setScannerError("Scan a valid owner QR first.");
      return;
    }

    if (!hasExactQrMatch) {
      setScannerError(
        "Use the latest current BPLO payment QR before receiving payment.",
      );
      return;
    }

    const tenderedAmount = Number(amountReceived);
    if (!Number.isFinite(tenderedAmount) || tenderedAmount <= 0) {
      setScannerError("Enter the amount received from the owner.");
      return;
    }

    if (matchedPayment.paymentStatus === "paid") {
      setScannerError("This payment is already marked as paid.");
      return;
    }

    if (tenderedAmount < remainingAmountDue) {
      setScannerError(
        `Insufficient amount received. The owner needs to pay ${formatCurrency(
          remainingAmountDue,
        )}.`,
      );
      return;
    }

    setIsSaving(true);
    setScannerError(null);

    const nextChange = tenderedAmount - remainingAmountDue;
    const receiptData: ReceiptPrintDataType = {
      receiptNumber: `MTR-${matchedPayment.applicationId
        .slice(-6)
        .toUpperCase()}-${Date.now().toString().slice(-6)}`,
      printedAtIso: new Date().toISOString(),
      applicationId: matchedPayment.applicationId,
      applicantName: matchedPayment.applicantName,
      permitType: matchedPayment.permitType,
      assessments: unpaidAssessments.map((assessment) => ({
        departmentName: assessment.departmentName,
        amount: Number(assessment.totalAmount ?? 0),
      })),
      totalDue: remainingAmountDue,
      amountReceived: tenderedAmount,
      change: nextChange,
    };

    try {
      await confirmMainTreasurerPaymentReceiptApi(
        matchedPayment.applicationId,
        {
          qrValue: parsedQr.rawValue,
          amountReceived: tenderedAmount,
        },
      );

      setSuccessMessage(
        `Payment recorded for ${matchedPayment.applicantName}. Change: ${formatCurrency(
          nextChange,
        )}. You can print the receipt below.`,
      );
      setLatestReceipt(receiptData);

      await loadRecords({ silent: true });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setScannerError(
        apiError?.response?.data?.message ??
          "Failed to mark the payment as paid.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!latestReceipt) {
      setScannerError("No receipt is ready to print yet.");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "noopener,noreferrer,width=980,height=760",
    );

    if (!printWindow) {
      setScannerError(
        "Could not open the print window. Please allow pop-ups and try again.",
      );
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildReceiptPrintHtml(latestReceipt));
    printWindow.document.close();
  };

  const showLoadingSkeleton = isLoading && !hasLoadedOnce;

  if (showLoadingSkeleton) {
    return <MainTreasurerScanPaymentSkeleton />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Scan Owner Payment QR
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Scan the owner QR, review the total amount due, enter the amount
            received, then mark the payment as paid.
          </p>
        </div>
      </div>

      {(error || scannerError) && (
        <div className="space-y-3">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
          {scannerError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              {scannerError}
            </div>
          )}
        </div>
      )}

      {successMessage && (
        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <p>{successMessage}</p>
          {latestReceipt && (
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-800"
            >
              <FiPrinter />
              Print Receipt
            </button>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#0F2942] uppercase tracking-wide">
                QR Scanner
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Use the camera or paste the raw QR text if you are using a USB
                scanner. Keep the owner QR centered and fully visible in the
                camera frame. Only BPLO-generated payment QR codes are allowed.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isScanning) {
                    stopCamera();
                    return;
                  }

                  void startCamera();
                }}
                disabled={isStartingCamera}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isScanning
                    ? "border border-[#0F2942] bg-[#0F2942] text-white hover:bg-[#143955]"
                    : "border border-transparent bg-[#F2C94C] text-[#0F2942] shadow-[0_10px_24px_rgba(242,201,76,0.28)] hover:bg-[#e6bf43]"
                }`}
              >
                {isStartingCamera ? (
                  <FiLoader className="animate-spin" />
                ) : isScanning ? (
                  <FiXCircle />
                ) : (
                  <FiCamera />
                )}
                {isScanning ? "Stop Camera" : "Start Camera"}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setParsedQr(null);
                  setManualQrValue("");
                  setAmountReceived("");
                  setSuccessMessage(null);
                  setLatestReceipt(null);
                  setScannerError(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#0F2942]"
              >
                <FiRefreshCw />
                Reset Scan
              </button>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-3xl border border-dashed border-[#0F2942]/15 bg-[#F4F8FC] p-4">
            <div className="aspect-4/3 overflow-hidden rounded-2xl border border-[#0F2942]/10 bg-[#0F2942]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              {!isScanning && (
                <div className="-mt-full flex h-full items-center justify-center p-6 text-center text-sm font-semibold text-white/90">
                  <div>
                    <FiSearch className="mx-auto mb-3 text-3xl text-[#F2C94C]" />
                    Start the camera and point it at the owner QR code.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <label
              htmlFor="manual-qr-value"
              className="text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]"
            >
              Manual QR Text
            </label>
            <textarea
              id="manual-qr-value"
              value={manualQrValue}
              onChange={(event) => setManualQrValue(event.target.value)}
              placeholder="Paste the full BPLO payment QR text here."
              className="mt-3 min-h-36 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0F2942] outline-none focus:border-[#0F2942]"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleManualQrSubmit}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0F2942] bg-white px-4 py-2 text-sm font-bold text-[#0F2942]"
              >
                <FiHash />
                Use QR Text
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
          <h2 className="text-lg font-black text-[#0F2942] uppercase tracking-wide">
            Payment Details
          </h2>

          {!parsedQr ? (
            <div className="mt-5 rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
              <FiCreditCard className="mx-auto mb-3 text-3xl text-[#0F2942]" />
              <p className="text-sm font-semibold text-[#0F2942]">
                Scan the owner QR first to load the current payment record.
              </p>
            </div>
          ) : parsedQr.isMalformedSystemQr ? (
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-800">
                Malformed Payment QR
              </p>
              <p className="mt-2 text-sm font-medium text-amber-800">
                Application ID: {parsedQr.applicationId || "Unavailable"}
              </p>
              {parsedQr.scannedTotalLabel && (
                <p className="mt-2 text-sm font-medium text-amber-800">
                  QR Total: {parsedQr.scannedTotalLabel}
                </p>
              )}
              <p className="mt-3 text-sm font-medium text-amber-900">
                Ask the owner to open the latest payment status QR and rescan
                it.
              </p>
            </div>
          ) : !matchedPayment ? (
            <div className="mt-5 rounded-3xl border border-red-200 bg-red-50 px-5 py-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-red-700">
                Invalid Payment QR
              </p>
              <p className="mt-2 text-sm font-medium text-red-700">
                Application ID: {parsedQr.applicationId || "Unavailable"}
              </p>
              {parsedQr.scannedTotalLabel && (
                <p className="mt-2 text-sm font-medium text-red-700">
                  QR Total: {parsedQr.scannedTotalLabel}
                </p>
              )}
              <p className="mt-3 text-sm font-medium text-red-700">
                No active main treasurer payment record was found for this
                application.
              </p>
            </div>
          ) : isOutdatedQr ? (
            <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-800">
                Outdated Payment QR
              </p>
              <p className="mt-2 text-sm font-medium text-amber-900">
                Applicant: {matchedPayment.applicantName}
              </p>
              <p className="mt-2 text-sm font-medium text-amber-900">
                Application ID: {matchedPayment.applicationId}
              </p>
              {parsedQr.scannedTotalLabel && (
                <p className="mt-2 text-sm font-medium text-amber-900">
                  Scanned QR Total: {parsedQr.scannedTotalLabel}
                </p>
              )}
              <p className="mt-2 text-sm font-medium text-amber-900">
                Current Treasurer Due: {formatCurrency(remainingAmountDue)}
              </p>
              <p className="mt-3 text-sm font-medium text-amber-900">
                The application is still in the treasurer list, but this QR is
                no longer the latest one for payment.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      Applicant
                    </p>
                    <h3 className="mt-2 text-xl font-black text-[#0F2942]">
                      {matchedPayment.applicantName}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-600">
                      {matchedPayment.applicantEmail}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                      matchedPayment.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {matchedPayment.paymentStatus === "paid"
                      ? "Paid"
                      : "Pending"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      Permit
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#0F2942]">
                      {matchedPayment.permitType}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                      Amount Due
                    </p>
                    <p className="mt-2 text-2xl font-black text-[#0F2942]">
                      {formatCurrency(remainingAmountDue)}
                    </p>
                    {parsedQr.scannedTotalLabel && (
                      <p className="mt-2 text-xs font-semibold text-gray-500">
                        QR issued total: {parsedQr.scannedTotalLabel}
                      </p>
                    )}
                    {hasMixedPaymentState && (
                      <p className="mt-2 text-xs font-semibold text-amber-700">
                        Remaining due is based on the unpaid departments only.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
                  Included Departments
                </p>
                <div className="mt-4 space-y-3">
                  {matchedPayment.assessments.map((assessment) => (
                    <div
                      key={`${matchedPayment.applicationId}_${assessment.departmentId}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#0F2942]">
                          {assessment.departmentName}
                        </p>
                        <p className="text-xs font-medium text-gray-500">
                          {assessment.paymentStatus === "paid"
                            ? "Already marked paid"
                            : "Waiting for payment"}
                        </p>
                      </div>
                      <p className="text-sm font-black text-[#0F2942]">
                        {formatCurrency(assessment.totalAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  void handleReceivePayment(event);
                }}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <label
                  htmlFor="amount-received"
                  className="text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]"
                >
                  Amount Received
                </label>
                <input
                  id="amount-received"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={amountReceived}
                  onChange={(event) => setAmountReceived(event.target.value)}
                  disabled={isSaving || matchedPayment.paymentStatus === "paid"}
                  placeholder="Enter the amount given by the owner"
                  className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-[#0F2942] outline-none focus:border-[#0F2942] disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-600">
                    <span>Total Due</span>
                    <span className="font-black text-[#0F2942]">
                      {formatCurrency(remainingAmountDue)}
                    </span>
                  </div>
                  {liveChangeDue !== null && (
                    <div
                      className={`mt-3 flex items-center justify-between gap-3 text-sm font-semibold ${
                        liveChangeDue >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      <span>
                        {liveChangeDue >= 0 ? "Change" : "Remaining Balance"}
                      </span>
                      <span className="font-black">
                        {formatCurrency(Math.abs(liveChangeDue))}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={
                      isSaving ||
                      matchedPayment.paymentStatus === "paid" ||
                      !hasExactQrMatch
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0F2942] px-5 py-3 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiCheckCircle />
                    )}
                    {matchedPayment.paymentStatus === "paid"
                      ? "Already Paid"
                      : "Receive Payment"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/home/main_treasurer/payments")}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-[#0F2942]"
                  >
                    <FiArrowLeft />
                    Go to Payments
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
