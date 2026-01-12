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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        res.data.role === "001" ? navigate("/admin_register") : navigate("/");
      }
    } catch (err) {
      setError("Sai email hoặc mật khẩu!");
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/google-login", {
        idToken: credentialResponse.credential 
      });
      handleLoginSuccess(res.data);
    } catch (err) {
      setError("Đăng nhập Google thất bại. Vui lòng thử lại!");
    }
  };

  const handleLoginSuccess = (data) => {
    if (data && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      data.role === "001" ? navigate("/admin_register") : navigate("/");
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
        
        /* CẬP NHẬT MÀU NÚT: MẶC ĐỊNH XÁM - HOVER ĐỎ */
        .btn-vietravel { 
          background-color: #6c757d; 
          color: white; 
          font-weight: 700; 
          padding: 12px; 
          border-radius: 10px; 
          border: none; 
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
      `}</style>

      <div className="login-card">
        <h2 className="login-title">Đăng nhập</h2>

        {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}

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

          <button type="submit" className="btn btn-vietravel w-100">ĐĂNG NHẬP</button>
        </form>

        <div className="text-center my-3 text-muted small">Hoặc</div>

        <div className="google-btn-container">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setError("Lỗi kết nối với Google")}
            useOneTap
            theme="outline"
            size="large"
            width="450px" 
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