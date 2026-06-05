import { BrowserRouter, Route, Routes } from "react-router-dom";
import Account from "@/pages/Account";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Home from "@/pages/Home";
import Privacy from "@/pages/Privacy";
import ProductDetail from "@/pages/ProductDetail";
import Products from "@/pages/Products";
import Terms from "@/pages/Terms";
import Forgot from "@/pages/auth/Forgot";
import Login from "@/pages/auth/Login";
import Reset from "@/pages/auth/Reset";
import Signup from "@/pages/auth/Signup";
import VNPayReturn from "@/pages/VNPayReturn";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminCustomers from "@/pages/admin/Customers";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminOrders from "@/pages/admin/Orders";
import AdminProducts from "@/pages/admin/Products";
import AdminSettings from "@/pages/admin/Settings";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot" element={<Forgot />} />
        <Route path="/auth/reset" element={<Reset />} />
        <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
