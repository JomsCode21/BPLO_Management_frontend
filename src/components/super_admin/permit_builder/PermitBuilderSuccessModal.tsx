import savedAnimation from "@/assets/Saved.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";

type PermitBuilderSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PermitBuilderSuccessModal({
  isOpen,
  onClose,
}: PermitBuilderSuccessModalProps) {
  return (
    <StatusModal
      isOpen={isOpen}
      type="success"
      title="Saved Successfully"
      message="Permit form changes have been saved."
      successAnimationSrc={savedAnimation}
      autoCloseMs={2000}
      onClose={onClose}
    />
  );
}
