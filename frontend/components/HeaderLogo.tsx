"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export default function HeaderLogo() {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 0 6px 0",
      }}
    >
      <Image
        src="/golf360-header.png"
        alt="Golf360 Header"
        width={220}
        height={90}
        priority
        style={{
          maxWidth: "95%",
          height: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}