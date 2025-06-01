import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface RejectPostDialogProps {
  isOpen: boolean;
  postId: string | null;
  onClose: () => void;
  onReject: (postId: string, reason: string) => void;
}

export default function RejectPostDialog({
  isOpen,
  postId,
  onClose,
  onReject,
}: RejectPostDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!postId || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await onReject(postId, reason);
      setReason("");
    } catch (error) {
      console.error("Error rejecting post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Post</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting this post. This will be
            visible to the post author.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rejection-reason">Rejection Reason</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Enter reason for rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? "Rejecting..." : "Reject Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
