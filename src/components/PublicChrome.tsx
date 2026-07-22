"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PublicChrome({
  ticker,
  live,
  header,
  footer,
  children,
}: {
  ticker: ReactNode;
  live: ReactNode;
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin =
    pathname === "/login" || pathname?.startsWith("/dashboard");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {ticker}
      {live}
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}
