import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
       username,
        email,
        password,
      });

      if (res.status === 201 || res.status === 200) {
        setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => navigate("/login"), 1500); // chuyển sang login sau 1.5s
      }
    } catch (err) {
      setError("Email đã tồn tại hoặc dữ liệu không hợp lệ!");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Đăng ký</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Họ và tên</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
          />
        </div>

        <div className="mb-3">
          <label>Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
          />
        </div>

        <button type="submit" className="btn btn-success w-100">
          Đăng ký
        </button>
      </form>

      <p className="text-center mt-3">
        Đã có tài khoản?{" "}
        <button
          type="button"
          className="btn btn-link p-0"
          onClick={() => navigate("/login")}
        >
          Đăng nhập
        </button>
      </p>
    </div>
  );
}

export default RegisterForm;
