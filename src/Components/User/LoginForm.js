import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from 'lucide-react'; 
import { GoogleLogin } from '@react-oauth/google';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Hàm xử lý chung khi đăng nhập thành công
  const handleLoginSuccess = (data) => {
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      
      // Chuyển hướng dựa trên role (Giả sử 001 là admin)
      data.role === "admin" || data.role === "001" 
        ? navigate("/") 
        : navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { email, password });
      handleLoginSuccess(res.data);
    } catch (err) {
      // CHỈNH SỬA: Lấy thông báo lỗi cụ thể từ Backend (ví dụ: lỗi bị Block)
      const message = err.response?.data?.message || "Sai email hoặc mật khẩu!";
      setError(message);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/google-login`, {
        idToken: credentialResponse.credential 
      });
      handleLoginSuccess(res.data);
    } catch (err) {
      // CHỈNH SỬA: Hiển thị lỗi nếu tài khoản Google bị Block
      const message = err.response?.data?.message || "Đăng nhập Google thất bại!";
      setError(message);
    }
  };

  return (
    <div className="login-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        .login-wrapper { font-family: 'Poppins', sans-serif; background-color: #f4f4f4; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .login-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 450px; }
        .login-title { color: #005294; font-weight: 700; text-align: center; margin-bottom: 30px; font-size: 28px; }
        .form-group-custom { position: relative; margin-bottom: 25px; }
        .form-group-custom label { font-size: 14px; font-weight: 600; margin-bottom: 5px; display: block; }
        .form-group-custom label span { color: red; }
        .input-underline { border: none; border-bottom: 1.5px solid #ccc; border-radius: 0; padding: 10px 0; width: 100%; outline: none; transition: border-color 0.3s; }
        .input-underline:focus { border-bottom-color: #005294; }
        .password-toggle { position: absolute; right: 0; bottom: 10px; cursor: pointer; color: #666; }
        
        .btn-vietravel { 
          background-color: #6c757d; 
          color: white; 
          font-weight: 700; 
          padding: 12px; 
          border-radius: 10px; 
          border: none; 
          width: 100%;
          margin-top: 10px; 
          text-transform: uppercase; 
          transition: all 0.3s ease; 
        }
        .btn-vietravel:hover { 
          background-color: #e31b23; 
          transform: translateY(-2px); 
          box-shadow: 0 5px 15px rgba(227, 27, 35, 0.3);
        }
        .google-btn-container { display: flex; justify-content: center; margin-top: 10px; width: 100%; }
        .alert-custom { background-color: #fff5f5; color: #e31b23; border: 1px solid #ffe3e3; padding: 10px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; font-weight: 500; }
      `}</style>

      <div className="login-card">
        <h2 className="login-title">Đăng nhập</h2>

        {error && <div className="alert-custom text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group-custom">
            <label>Số điện thoại hoặc email <span>*</span></label>
            <input
              type="email"
              className="input-underline"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required
            />
          </div>

          <div className="form-group-custom">
            <label>Mật khẩu <span>*</span></label>
            <input
              type={showPassword ? "text" : "password"}
              className="input-underline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
            <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <p className="text-center small mb-4">
            Chưa là thành viên? <span className="text-primary fw-bold" style={{cursor:'pointer'}} onClick={() => navigate("/register")}>Đăng ký ngay</span>
          </p>

          <button type="submit" className="btn btn-vietravel">ĐĂNG NHẬP</button>
        </form>

        <div className="text-center my-3 text-muted small">Hoặc</div>

        <div className="google-btn-container">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setError("Lỗi kết nối với Google")}
            useOneTap
            theme="outline"
            size="large"
            width="100%" 
          />
        </div>

        <div className="text-center mt-4">
            <button className="btn btn-link btn-sm text-muted text-decoration-none" onClick={() => navigate("/forgot_password")}>
                Quên Mật Khẩu?
            </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;