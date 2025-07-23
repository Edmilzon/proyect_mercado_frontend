"use client";
import NavBar from "@/components/common/NavBar/NavBar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/" && <NavBar />}
      {children}
    </>
  );
} 