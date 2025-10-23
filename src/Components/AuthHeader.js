import React from "react";
import { useNavigate, Link } from "react-router-dom";

function AuthHeader() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/lufian">
        🍽️ Tourify
      </Link>

      <div className="ms-auto d-flex align-items-center gap-3">
        {token && role === "admin" ? (
          <>
            <Link className="btn btn-outline-light" to="/tours_admin">
              Quản lý Tour
            </Link>
            <Link className="btn btn-outline-light" to="/categoris_admin">
              Quản lý Danh Mục
            </Link>
            <Link className="btn btn-outline-light" to="/manage-users">
              Quản Lý Người Dùng
            </Link>
            <Link className="btn btn-outline-light" to="/admin-custom-tour">
             Chờ Xác Nhận Tour Tự Chọn
            </Link>
            
          </>
        ) : token ? (
          <>
  <Link className="btn btn-outline-light me-2" to="/">
    Trang chủ
  </Link>
<Link className="btn btn-outline-light" to="/payment">
    Chờ Thanh Toán 
  </Link>
  
  <Link className="btn btn-outline-light" to="/tours-users">
    Tour du lịch
  </Link>
</>
          
        ) : null}

        {token ? (
          <button className="btn btn-danger" onClick={handleLogout}>
            Đăng xuất
          </button>
        ) : (
          <Link to="/login" className="btn btn-success">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}

export default AuthHeader;
