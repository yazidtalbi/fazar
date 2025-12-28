"use client";

import React, { createContext, useContext, type ReactNode } from "react";
import type { AccountContext } from "@/lib/server/account/types";

const AccountContextValue = createContext<AccountContext | null>(null);

export function AccountProvider({
  children,
  account,
}: {
  children: ReactNode;
  account: AccountContext | null;
}) {
  return (
    <AccountContextValue.Provider value={account}>
      {children}
    </AccountContextValue.Provider>
  );
}

export function useAccount(): AccountContext | null {
  return useContext(AccountContextValue);
}

