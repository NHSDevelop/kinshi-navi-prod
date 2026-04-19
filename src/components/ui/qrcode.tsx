"use client";

import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";

interface QRCodeProps {
  text: string;
  size?: number;
  className?: string;
}

const QRCode = ({ text, size = 256, className }: QRCodeProps) => {
  return (
    <QRCodeCanvas
      value={text}
      size={size}
      className={cn("h-auto w-full", className)}
      style={{ maxWidth: size }}
      level={"L"}
      imageSettings={{
        src: "/images/icon-512x512.png",
        x: undefined,
        y: undefined,
        height: size / 4,
        width: size / 4,
        excavate: true,
      }}
    />
  );
};

export default QRCode;
