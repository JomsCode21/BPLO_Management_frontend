import savedAnimation from "@/assets/Saved.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";

type EvaluatorRequestSaveStatusModalProps = {
  isOpen: boolean;
  message: string;
  onClose: () => void;
};

export default function EvaluatorRequestSaveStatusModal({
  isOpen,
  message,
  onClose,
}: EvaluatorRequestSaveStatusModalProps) {
  return (
    <StatusModal
      isOpen={isOpen}
      type="success"
      title="Evaluation Saved"
      message={message}
      successAnimationSrc={savedAnimation}
      autoCloseMs={2000}
      onClose={onClose}
    />
  );
}
