import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleAlert } from "lucide-react";

type ErrorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
};

export const ErrorPrompt = ({ error }: ErrorProps) => {
  return (
    <Alert variant="error">
      <CircleAlert />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
