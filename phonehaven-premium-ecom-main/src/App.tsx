import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { AppProviders } from "./lib/store";
import { RequireAuth } from "./components/RequireAuth";

import { Route as HomeRoute } from "./pages/index";
import { Route as AboutRoute } from "./pages/about";
import { Route as AccessoriesRoute } from "./pages/accessories";
import { Route as AccountRoute } from "./pages/account";
import { Route as BlogRoute } from "./pages/blog";
import { Route as BrandsRoute } from "./pages/brands";
import { Route as CartRoute } from "./pages/cart";
import { Route as CheckoutRoute } from "./pages/checkout";
import { Route as ContactRoute } from "./pages/contact";
import { Route as CorporateRoute } from "./pages/corporate";
import { Route as ExchangeRoute } from "./pages/exchange";
import { Route as FaqsRoute } from "./pages/faqs";
import { Route as LoginRoute } from "./pages/login";
import { Route as ForgotPasswordRoute } from "./pages/forgot-password";
import { Route as ResetPasswordRoute } from "./pages/reset-password";
import { Route as OffersRoute } from "./pages/offers";
import { Route as OrderSuccessRoute } from "./pages/order-success";
import { Route as PrivacyRoute } from "./pages/privacy-policy";
import { Route as ProductRoute } from "./pages/product.slug";
import { Route as RefundRoute } from "./pages/refund-policy";
import { Route as RegisterRoute } from "./pages/register";
import { Route as RepairRoute } from "./pages/repair";
import { Route as ShippingRoute } from "./pages/shipping-policy";
import { Route as ShopRoute } from "./pages/shop";
import { Route as StoreLocatorRoute } from "./pages/store-locator";
import { Route as StudentOfferRoute } from "./pages/student-offer";
import { Route as TermsRoute } from "./pages/terms";
import { Route as TrackOrderRoute } from "./pages/track-order";
import { Route as WarrantyRoute } from "./pages/warranty-policy";
import { Route as WishlistRoute } from "./pages/wishlist";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium tracking-wider uppercase text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomeRoute.Component />} />
          <Route path="/about" element={<AboutRoute.Component />} />
          <Route path="/accessories" element={<AccessoriesRoute.Component />} />
          <Route
            path="/account"
            element={
              <RequireAuth reason="Please sign in to view your account.">
                <AccountRoute.Component />
              </RequireAuth>
            }
          />
          <Route path="/blog" element={<BlogRoute.Component />} />
          <Route path="/brands" element={<BrandsRoute.Component />} />
          <Route path="/cart" element={<CartRoute.Component />} />
          <Route
            path="/checkout"
            element={
              <RequireAuth pendingAction={{ type: "checkout" }} reason="Please sign in to complete your purchase.">
                <CheckoutRoute.Component />
              </RequireAuth>
            }
          />
          <Route path="/contact" element={<ContactRoute.Component />} />
          <Route path="/corporate" element={<CorporateRoute.Component />} />
          <Route path="/exchange" element={<ExchangeRoute.Component />} />
          <Route path="/faqs" element={<FaqsRoute.Component />} />
          <Route path="/login" element={<LoginRoute.Component />} />
          <Route path="/forgot-password" element={<ForgotPasswordRoute.Component />} />
          <Route path="/reset-password" element={<ResetPasswordRoute.Component />} />
          <Route path="/offers" element={<OffersRoute.Component />} />
          <Route
            path="/order-success"
            element={
              <RequireAuth reason="Please sign in to view your order.">
                <OrderSuccessRoute.Component />
              </RequireAuth>
            }
          />
          <Route path="/privacy-policy" element={<PrivacyRoute.Component />} />
          <Route path="/product/:slug" element={<ProductRoute.Component />} />
          <Route path="/refund-policy" element={<RefundRoute.Component />} />
          <Route path="/register" element={<RegisterRoute.Component />} />
          <Route path="/repair" element={<RepairRoute.Component />} />
          <Route path="/shipping-policy" element={<ShippingRoute.Component />} />
          <Route path="/shop" element={<ShopRoute.Component />} />
          <Route path="/store-locator" element={<StoreLocatorRoute.Component />} />
          <Route path="/student-offer" element={<StudentOfferRoute.Component />} />
          <Route path="/terms" element={<TermsRoute.Component />} />
          <Route path="/track-order" element={<TrackOrderRoute.Component />} />
          <Route path="/warranty-policy" element={<WarrantyRoute.Component />} />
          <Route
            path="/wishlist"
            element={
              <RequireAuth reason="Please sign in to view your wishlist.">
                <WishlistRoute.Component />
              </RequireAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppProviders>
    </QueryClientProvider>
  );
}
