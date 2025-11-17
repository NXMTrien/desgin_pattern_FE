import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import axios from "axios";



function RegisterForm() {

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState(""); 
  
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
        phone, 
        dateOfBirth, 
      });



      if (res.status === 201) {
        setSuccess(res.data.message || "Đăng ký thành công! Vui lòng kiểm tra Email.");
        // Chuyển sang trang xác thực và truyền email để form xác thực biết email nào cần verify
        setTimeout(() => navigate("/verify-email", { state: { email: email } }), 1500); 
      }
    } catch (err) {
      // Server trả về lỗi 409 (trùng lặp) hoặc 400/403 (dữ liệu/tuổi)
      const errorMessage = err.response?.data?.message || "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";
      setError(errorMessage);
    }
  };



  return (

    <div className="container mt-5" style={{ maxWidth: "400px" }}>

      <h2 className="text-center mb-4">Đăng ký</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {success && <div className="alert alert-success">{success}</div>}



      <form onSubmit={handleSubmit}>

        <div className="mb-3">
            <label>Họ và Tên</label>
            <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập" required/>
        </div>

        <div className="mb-3">
            <label>Ngày sinh</label>
            <input type="date" className="form-control" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required/>

        </div>
        
       
        <div className="mb-3">
            <label>Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email" required/>
        </div>

        <div className="mb-3">
            <label>Số điện thoại</label>
            <input type="tel" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" required/>
        </div>
        
        <div className="mb-3">
          <label>Mật khẩu</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required/>
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