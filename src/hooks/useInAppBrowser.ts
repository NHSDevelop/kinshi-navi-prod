import { useEffect, useState } from "react";

export function useInAppBrowser() {
  const [info, setInfo] = useState<{ isInApp: boolean; name?: string }>({
    isInApp: false,
  });

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    const checks: { name: string; rx: RegExp }[] = [
      { name: "LINE", rx: /Line\//i },
      { name: "Twitter/X", rx: /Twitter|X-Request-With|Twitter for/i },
      { name: "Facebook", rx: /FBAN|FBAV/i },
      { name: "Instagram", rx: /Instagram/i },
      { name: "Android WebView", rx: /\bwv\b|Android.*Version\/\d+\.\d+/i },
    ];
    for (const c of checks) {
      if (c.rx.test(ua)) {
        setInfo({ isInApp: true, name: c.name });
        return;
      }
    }
    // iOS heuristic: WebView often has AppleWebKit but not "Safari"
    if (/AppleWebKit/i.test(ua) && !/Safari/i.test(ua) && /Mobile/i.test(ua)) {
      setInfo({ isInApp: true, name: "InApp WebView" });
    }
  }, []);

  return info;
}
