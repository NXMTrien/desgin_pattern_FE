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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 sticky-top">
      <div className="container-fluid">
        {/* LOGO */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <div className="rounded-circle d-inline-block me-2" style={{ width: 36, height: 36, backgroundColor: '#0d6efd' }}></div>
          <span style={{ fontWeight: 700, color: '#fff' }}>Tourify</span>
        </Link>

        {/* Nút Toggle cho Mobile */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navmenu">
          {/* 1. MENU ĐIỀU HƯỚNG CHUNG (Ai truy cập cũng thấy) */}
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
                <Link className="nav-link " to="/payment">Thanh toán</Link>
              </li>
            )}

            {/* Menu dành riêng cho ADMIN */}
            {token && role === "admin" && (
              <>
                <li className="nav-item"><Link className="nav-link text-warning" to="/tours_admin">Quản lý Tour</Link></li>
                <li className="nav-item"><Link className="nav-link text-warning" to="/admin_payment">Xác nhận thanh toán</Link></li>
                <li className="nav-item"><Link className="nav-link text-warning" to="/manage-users">Quản lý User</Link></li>
              </>
            )}
          </ul>

          {/* 2. PHẦN TÀI KHOẢN (Thay đổi dựa trên Login) */}
          <div className="d-flex align-items-center gap-3">
            {token ? (
              /* ĐÃ ĐĂNG NHẬP: Hiển thị Dropdown tên */
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
              /* CHƯA ĐĂNG NHẬP: Hiển thị nút Đăng nhập */
              <Link to="/login" className="btn btn-primary rounded-pill px-4">
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