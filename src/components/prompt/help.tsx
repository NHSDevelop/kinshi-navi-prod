import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { MdHelpOutline } from "react-icons/md";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const HelpPrompt = ({ title, description, children }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <MdHelpOutline className="min-h-6 w-auto" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
