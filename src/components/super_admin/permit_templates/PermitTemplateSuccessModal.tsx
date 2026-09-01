import savedAnimation from "@/assets/Saved.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";

type PermitTemplateSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PermitTemplateSuccessModal({
  isOpen,
  onClose,
}: PermitTemplateSuccessModalProps) {
  return (
    <StatusModal
      isOpen={isOpen}
      type="success"
      title="Saved Successfully"
      message="Template mappings and watermark settings have been saved."
      successAnimationSrc={savedAnimation}
      autoCloseMs={1800}
      onClose={onClose}
    />
  );
}
