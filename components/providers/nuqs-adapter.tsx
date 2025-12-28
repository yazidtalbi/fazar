"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ReactNode } from "react";

export function NuqsAdapterProvider({ children }: { children: ReactNode }): React.ReactElement {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}

