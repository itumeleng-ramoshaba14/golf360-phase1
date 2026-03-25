"use client";

import { usePathname } from "next/navigation";
import HeaderLogo from "@/components/HeaderLogo";
import Navbar from "@/components/Navbar";

export default function AppChrome() {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <HeaderLogo />
      <Navbar />
    </>
  );
}