import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, User, Mail, Phone, Calendar, Lock, ShieldCheck } from 'lucide-react';

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // KIỂM TRA TẠI FRONTEND: Mật khẩu khớp nhau mới gửi API
    if (password !== confirmPassword) {
        setError("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!");
        return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        email,
        password,
        confirmPassword, // Gửi lên để backend kiểm tra lần nữa (như logic bạn vừa viết)
        phone,
        dateOfBirth,
      });

      if (res.status === 201) {
        setSuccess(res.data.message || "Đăng ký thành công! Vui lòng kiểm tra Email.");
        setTimeout(() => navigate("/verify-email", { state: { email: email } }), 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(errorMessage);
    }
  };

  return (
    <div className="register-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

        .register-wrapper {
          font-family: 'Poppins', sans-serif;
          background-color: #f4f4f4;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .register-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          width: 100%;
          max-width: 500px;
        }

        .brand-logo {
          display: block;
          margin: 0 auto 20px;
          max-width: 150px;
          cursor: pointer;
        }

        .register-title {
          color: #005294;
          font-weight: 700;
          text-align: center;
          margin-bottom: 30px;
          font-size: 28px;
        }

        .form-group-custom {
          position: relative;
          margin-bottom: 20px;
        }

        .form-group-custom label {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 5px;
          display: block;
          color: #333;
        }

        .form-group-custom label span { color: red; }

        .input-underline {
          border: none;
          border-bottom: 1.5px solid #ccc;
          border-radius: 0;
          padding: 8px 0;
          width: 100%;
          outline: none;
          transition: border-color 0.3s;
          background: transparent;
        }

        .input-underline:focus {
          border-bottom-color: #005294;
        }

        .password-toggle {
          position: absolute;
          right: 0;
          bottom: 8px;
          cursor: pointer;
          color: #666;
        }

        .btn-register {
          background-color: #e31b23;
          color: white;
          font-weight: 700;
          padding: 12px;
          border-radius: 10px;
          border: none;
          margin-top: 25px;
          text-transform: uppercase;
          width: 100%;
          transition: all 0.3s;
        }

        .btn-register:hover { 
          background-color: #c41219; 
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(227, 27, 35, 0.3);
        }

        .login-link {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
        }

        .btn-link-custom {
          color: #005294;
          font-weight: 700;
          text-decoration: none;
          border: none;
          background: none;
          padding: 0;
        }

        .input-container {
          position: relative;
        }
        
        .field-icon {
          position: absolute;
          right: 0;
          bottom: 8px;
          color: #ccc;
          pointer-events: none;
        }
      `}</style>

      <div className="register-card">
        
        <h2 className="register-title">Đăng ký thành viên</h2>

        {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}
        {success && <div className="alert alert-success py-2 small text-center">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Tên đăng nhập */}
          <div className="form-group-custom">
            <label>Họ và Tên <span>*</span></label>
            <div className="input-container">
              <input
                type="text"
                className="input-underline"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập họ và tên"
                required
              />
              <User size={18} className="field-icon" />
            </div>
          </div>

          {/* Ngày sinh */}
          <div className="form-group-custom">
            <label>Ngày sinh <span>*</span></label>
            <div className="input-container">
              <input
                type="date"
                className="input-underline"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
              <Calendar size={18} className="field-icon" />
            </div>
          </div>

          {/* Email */}
          <div className="form-group-custom">
            <label>Email <span>*</span></label>
            <div className="input-container">
              <input
                type="email"
                className="input-underline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vidu@email.com"
                required
              />
              <Mail size={18} className="field-icon" />
            </div>
          </div>

          {/* Điện thoại */}
          <div className="form-group-custom">
            <label>Số điện thoại <span>*</span></label>
            <div className="input-container">
              <input
                type="tel"
                className="input-underline"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                required
              />
              <Phone size={18} className="field-icon" />
            </div>
          </div>

          {/* Mật khẩu */}
          <div className="form-group-custom">
            <label>Mật khẩu <span>*</span></label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                className="input-underline"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
              <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          {/* TRƯỜNG MỚI: Xác nhận mật khẩu */}
          <div className="form-group-custom">
            <label>Xác nhận mật khẩu <span>*</span></label>
            <div className="input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input-underline"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
              <div className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-register">ĐĂNG KÝ NGAY</button>
        </form>

        <div className="login-link">
          Đã có tài khoản?{" "}
          <button
            type="button"
            className="btn-link-custom"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;