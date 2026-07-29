import { CircleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function HoldBanner({
  holdReason,
  onChatClick,
}: {
  holdReason: string | null;
  onChatClick?: () => void;
}) {
  return (
    <Alert variant="destructive" className="items-start bg-destructive/5 px-4 py-4">
      <CircleAlert />
      <div className="flex-1">
        <AlertTitle>Your delivery needs attention</AlertTitle>
        <AlertDescription className="text-destructive/80">
          {holdReason ?? "Please chat with our support team to resolve this."}
        </AlertDescription>
        {onChatClick && (
          <Button variant="destructive" size="sm" className="mt-3" onClick={onChatClick}>
            Chat with support
          </Button>
        )}
      </div>
    </Alert>
  );
}
