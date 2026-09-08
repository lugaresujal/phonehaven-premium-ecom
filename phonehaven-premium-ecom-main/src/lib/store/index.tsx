import * as React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./auth";
import { CartProvider } from "./cart";
import { WishlistProvider } from "./wishlist";
import { OrdersProvider } from "./orders";
import { ProductsProvider } from "../products-store";
import { CmsProvider } from "../cms-store";
import { SettingsProvider } from "./settings-store";

export const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <ProductsProvider>
      <CmsProvider>
        <SettingsProvider>
          <AuthProvider>
            <WishlistProvider>
              <CartProvider>
                <OrdersProvider>{children}</OrdersProvider>
              </CartProvider>
            </WishlistProvider>
          </AuthProvider>
        </SettingsProvider>
      </CmsProvider>
    </ProductsProvider>
  );

  if (!GOOGLE_CLIENT_ID) {
    return content;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {content}
    </GoogleOAuthProvider>
  );
}

export * from "./auth";
export * from "./cart";
export * from "./wishlist";
export * from "./orders";
export * from "./protected";
export * from "../products-store";
export * from "../cms-store";
export * from "./settings-store";

