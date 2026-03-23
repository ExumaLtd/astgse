import { TrashIcon } from "@sanity/icons";
import { useDocumentOperation } from "sanity";

export function DeleteEnquiryAction({ id, type, onComplete }: { id: string; type: string; onComplete: () => void }) {
  const { delete: deleteOp } = useDocumentOperation(id, type);

  return {
    label: "Delete",
    icon: TrashIcon,
    tone: "critical" as const,
    onHandle() {
      if (confirm("Delete this enquiry? This cannot be undone.")) {
        deleteOp.execute();
        onComplete();
      }
    },
  };
}
