import "./App.css";
import { ApiTest } from "./test/ApiTest";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { Dashboard } from "./pages/Dashboard";
import { Orders } from "./pages/Orders";
import { Products } from "./pages/Products";
import { Inventory } from "./pages/Inventory";
import { Customers } from "./pages/Customers";
import { Brands } from "./pages/Brands";
import { Categories } from "./pages/Categories";
import { Offers } from "./pages/Offers";
import { Coupons } from "./pages/Coupons";
import { Banners } from "./pages/Banners";
import { Reviews } from "./pages/Reviews";
import { Returns } from "./pages/Returns";
import { Exchanges } from "./pages/Exchanges";
import { Payments } from "./pages/Payments";
import { Blog } from "./pages/Blog";
import { FAQs } from "./pages/FAQs";
import { Repairs } from "./pages/Repairs";
import { Stores } from "./pages/Stores";
import { Enquiries } from "./pages/Enquiries";
import { Corporate } from "./pages/Corporate";
import { Staff } from "./pages/Staff";
import { ActivityLogs } from "./pages/ActivityLogs";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";


function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/coupons" element={<Coupons />} />
                    <Route path="/banners" element={<Banners />} />
                    <Route path="/reviews" element={<Reviews />} />
                    <Route path="/returns" element={<Returns />} />
                    <Route path="/exchanges" element={<Exchanges />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/repairs" element={<Repairs />} />
                    <Route path="/stores" element={<Stores />} />
                    <Route path="/enquiries" element={<Enquiries />} />
                    <Route path="/corporate" element={<Corporate />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/activity-logs" element={<ActivityLogs />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/api-test" element={<ApiTest />} />
                    <Route
                      path="*"
                      element={
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "1rem" }}>
                          <h2 style={{ fontSize: "2rem", fontWeight: 700 }}>404 – Page Not Found</h2>
                          <p style={{ color: "#6b7280" }}>The page you're looking for doesn't exist or has been moved.</p>
                          <a href="/" style={{ background: "#111", color: "#fff", padding: "0.6rem 1.5rem", borderRadius: "9999px", textDecoration: "none", fontSize: "0.875rem" }}>Return Home</a>
                        </div>
                      }
                    />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;