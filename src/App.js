import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './Components/HomePage';
import AuthHeader from './Components/AuthHeader';
import LoginForm from './Components/LoginForm';
import RegisterForm from './Components/RegisterForm';
import ProfileView from './Components/ProfileView';
import CategoryForm from './Components/CategoryForm';
import TourForm from './Components/TourForm';
import UserForm from './Components/UserManagementForm';
import TourList from './Components/TourList';
import CustomTourPage from './Components/CustomTourPage';
import AdminCustomTourPage from './Components/AdminCustomTourPage';
import PaymentPage from './Components/PaymentPage';
import VerifyEmailForm from './Components/VerifyEmailForm';
import ForgotPassword from './Components/ForgotPassword';
import CheckoutBankPage from './Components/CheckoutPage';
import TourDetail from './Components/TourDetail';
import AdminPaymentConfirmation from './Components/AdminPaymentConfirmation';
import MyBookings from './Components/BookingUser';
import Footer from './Components/AuthFooter';
import AdminBooking from './Components/AdminBookingManager';
import { customAlert } from './utils/customAlert';
import Contact from './Components/ContactPage';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('currentUser');
      if (token && user && user !== "undefined") {
        const userDetails = JSON.parse(user);
        setIsLoggedIn(true);
        setCurrentUser(userDetails);
      }
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }, []);

  // Cập nhật hàm này để nhận thêm role (vì login thường hay google đều trả về role)
  const handleLoginSuccess = (token, username, email, role) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('role', role); // Lưu thêm role vào máy
    
    const userDetails = { username, email, role };
    localStorage.setItem('currentUser', JSON.stringify(userDetails));
    
    customAlert(`Đăng nhập thành công! Chào mừng ${username || email}`);
    setIsLoggedIn(true);
    setCurrentUser(userDetails);

    // Chuyển hướng dựa trên role
    role === "admin" ? navigate("/categoris_admin") : navigate("/"); 
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setCurrentUser(null);
    customAlert('Bạn đã đăng xuất.');
    navigate("/login");
  };

  return (
    <GoogleOAuthProvider clientId="292302259329-j3g04hfov9h6u3e138v4cjdue3j1p86t.apps.googleusercontent.com">
    <div className="bg-light min-vh-100">
      <AuthHeader isLoggedIn={isLoggedIn} onLogout={handleLogout} username={currentUser?.username} />

      <main className="container pt-5 pb-5">
        <Routes>
           <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterForm />} />
            <Route path="/categoris_admin" element={<CategoryForm />} />
            <Route path="/tours_admin" element={<TourForm />} />
            <Route path="/manage-users" element={<UserForm />} />
               <Route path="/tours-users" element={<TourList />} />
               <Route path="/custom-tour" element={<CustomTourPage />} />
                <Route path="/admin-custom-tour" element={<AdminCustomTourPage />} />
               <Route path="/payment" element={<PaymentPage />} />
               <Route path="/verify-email" element={<VerifyEmailForm/>} />
               <Route path="/forgot_password" element={<ForgotPassword/>} />
                <Route path="/checkout/:bookingId" element={<CheckoutBankPage/>} />
                <Route path="/tour_detail/:id" element={<TourDetail/>} />
                <Route path="/admin_payment" element={<AdminPaymentConfirmation />} />
                <Route path="/contact" element={<Contact />} />
                 <Route path="/my-bookings" element={<MyBookings />} />
               <Route path="/admin_booking" element={<AdminBooking />} />
          <Route path="/profile" element={<ProfileView currentUser={currentUser} onLogout={handleLogout} />} />
        </Routes>
      </main>
        <Footer />

      <div id="custom-alert" className="fixed-bottom end-0 text-white p-3 rounded-start shadow-lg z-3 d-none"></div>
    </div>
    </GoogleOAuthProvider>
  );
}
