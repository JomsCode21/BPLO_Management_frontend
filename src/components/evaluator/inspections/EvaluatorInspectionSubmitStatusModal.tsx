import savedAnimation from "@/assets/Saved.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";

type EvaluatorInspectionSubmitStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function EvaluatorInspectionSubmitStatusModal({
  isOpen,
  onClose,
}: EvaluatorInspectionSubmitStatusModalProps) {
  return (
    <StatusModal
      isOpen={isOpen}
      type="success"
      title="Submitted"
      message="Paid application has been submitted for BPLO admin approval."
      successAnimationSrc={savedAnimation}
      autoCloseMs={1800}
      onClose={onClose}
    />
  );
}
