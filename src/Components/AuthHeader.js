import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavDropdown } from 'react-bootstrap';
import axios from 'axios';

function AuthHeader() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (err) {
          console.error("Không thể lấy thông tin người dùng", err);
          if (err.response?.status === 401) handleLogout();
        }
      }
    };
    fetchUserData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 sticky-top shadow">
      <div className="container-fluid">
        {/* LOGO */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
  {/* Biểu tượng Logo mới */}
  <div 
    className="d-flex align-items-center justify-content-center me-2 shadow-sm" 
    style={{ 
      width: '40px', 
      height: '40px', 
      backgroundColor: '#0d6efd', 
      borderRadius: '50%',     
      color: '#ffffff' 
    }}
  >
    <i className="bi bi-airplane-fill" style={{ fontSize: '24px' }}></i>
  </div>

  {/* Tên thương hiệu */}
  <span style={{ 
    fontWeight: 500, 
    color: '#fff', 
    letterSpacing: '1px',
    fontSize: '20px'
  }}>
    Tourify_Magic
  </span>
</Link>

        {/* Nút Toggle cho Mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navmenu">
          {/* 1. MENU ĐIỀU HƯỚNG CHUNG */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Trang chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tours-users">Tours</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Liên hệ</Link>
            </li>

            {/* Menu dành riêng cho USER đã đăng nhập */}
            {token && role !== "admin" && (
              <li className="nav-item">
                <Link className="nav-link" to="/payment">Thanh toán</Link>
              </li>
            )}

            {/* --- PHẦN ADMIN ĐÃ ĐƯỢC GOM NHÓM --- */}
            {token && role === "admin" && (
              <NavDropdown 
                title={<span className="text-warning fw-bold"> Quản trị</span>} 
                id="admin-management-dropdown"
                menuVariant="dark"
              >
                <NavDropdown.Item as={Link} to="/admin_booking">
                  <i className="bi bi-calendar-check me-2"></i> Quản lý Booking
                </NavDropdown.Item>
                
                <NavDropdown.Item as={Link} to="/tours_admin">
                  <i className="bi bi-map me-2"></i> Quản lý Tour
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to="/admin_payment">
                  <i className="bi bi-credit-card me-2"></i> Xác nhận thanh toán
                </NavDropdown.Item>

                <NavDropdown.Item as={Link} to="/admin/contact">
                  <i className="bi bi-credit-card me-2"></i>CSKH
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item as={Link} to="/manage-users">
                  <i className="bi bi-people me-2"></i> Quản lý Người dùng
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </ul>

          {/* 2. PHẦN TÀI KHOẢN (Hiển thị cuối Navbar) */}
          <div className="d-flex align-items-center gap-3">
            {token ? (
              <NavDropdown
                title={
                  <span className="fw-bold text-white">
                    <i className="bi bi-person-circle me-1"></i>
                    {currentUser?.username || "Thành viên"}
                  </span>
                }
                id="user-dropdown-menu"
                align="end"
                menuVariant="light"
              >
                <NavDropdown.Item onClick={() => navigate('/profile')}>
                  <i className="bi bi-person me-2"></i> Hồ sơ của tôi
                </NavDropdown.Item>

                <NavDropdown.Item onClick={() => navigate('/my-bookings')}>
                  <i className="bi bi-journal-check me-2"></i> Lịch sử đặt tour
                </NavDropdown.Item>

                <NavDropdown.Divider />

                <NavDropdown.Item className="text-danger fw-bold" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link to="/login" className="btn btn-primary rounded-pill px-4 shadow-sm">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AuthHeader;