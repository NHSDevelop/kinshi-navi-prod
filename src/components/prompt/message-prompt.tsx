import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleCheck } from "lucide-react";

type MessageProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any;
};

export const MessagePrompt = ({ message }: MessageProps) => {
  return (
    <Alert>
      <CircleCheck />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
