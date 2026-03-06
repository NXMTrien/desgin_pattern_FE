import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { NavDropdown, Badge, Navbar, Container, Nav } from 'react-bootstrap';
import axios from 'axios';
import { io } from "socket.io-client";

function AuthHeader() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL;

  // 1. Fetch thông tin User và Thông báo cũ
  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const [userRes, notiRes] = await Promise.all([
            axios.get(`${API_URL}/api/auth/me`, { 
              headers: { Authorization: `Bearer ${token}` } 
            }),
            axios.get(`${API_URL}/api/notifications`, { 
              headers: { Authorization: `Bearer ${token}` } 
            })
          ]);
          setCurrentUser(userRes.data);
          setNotifications(notiRes.data.data || []);
          setUnreadCount(notiRes.data.unreadCount || 0);
        } catch (err) {
          console.error("Lỗi xác thực", err);
          if (err.response?.status === 401) handleLogout();
        }
      };
      fetchData();
    }
  }, [token, API_URL]);

  // 2. Logic Socket.io Real-time
  useEffect(() => {
    let socket;
    if (token && currentUser?._id) {
      socket = io(API_URL, { auth: { token } });
      
      socket.emit('setup', currentUser);

      socket.on("newNotification", (newNotif) => {
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        if (Notification.permission === "granted") {
          new Notification("Tourify Update", { body: newNotif.message, icon: "/favicon.ico" });
        }
      });

      if (role === 'admin') {
        socket.emit('join_admin_room');
      }

      socket.on("connect_error", (err) => console.error("Socket error:", err.message));
    }
    return () => { if (socket) socket.disconnect(); };
  }, [token, currentUser, API_URL, role]);

  // 3. Xin quyền thông báo trình duyệt
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/login");
  };

  const markRead = async (id, link) => {
    try {
      await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) navigate(link);
    } catch (err) { console.error("Lỗi đánh dấu đã đọc:", err); }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow py-2 px-3">
      <Container fluid>
        {/* LOGO */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div 
            className="d-flex align-items-center justify-content-center me-2 shadow-sm" 
            style={{ 
              width: '40px', height: '40px', backgroundColor: '#0d6efd', 
              borderRadius: '50%', color: '#ffffff' 
            }}
          >
            <i className="bi bi-airplane-fill" style={{ fontSize: '24px' }}></i>
          </div>
          <span className="fw-bold text-white fs-4" style={{ letterSpacing: '1px' }}>
            Tourify_Magic
          </span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navmenu" />
        <Navbar.Collapse id="navmenu">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/tours-users">Tours</Nav.Link>
            <Nav.Link as={Link} to="/contact">Liên hệ</Nav.Link>

            {/* Menu dành riêng cho USER đã đăng nhập (không phải admin) */}
            {token && role !== "admin" && (
              <Nav.Link as={Link} to="/payment">Thanh toán</Nav.Link>
            )}

            {/* PHẦN QUẢN TRỊ VIÊN */}
            {token && role === "admin" && (
              <NavDropdown 
                title={<span className="text-warning fw-bold">Quản trị</span>} 
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
                  <i className="bi bi-headset me-2"></i> CSKH
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/manage-users">
                  <i className="bi bi-people me-2"></i> Quản lý Người dùng
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>

          <Nav className="align-items-center gap-3">
            {token ? (
              <>
                {/* CHUÔNG THÔNG BÁO */}
                <NavDropdown 
                  title={
                    <div className="position-relative p-1">
                      <i className="bi bi-bell fs-5 text-white"></i>
                      {unreadCount > 0 && (
                        <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle border border-light" style={{fontSize: '0.65rem'}}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  }
                  align="end"
                  id="notif-dropdown"
                  className="hide-caret"
                >
                  <div style={{ width: '350px', maxHeight: '480px', display: 'flex', flexDirection: 'column' }}>
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                      <span className="fw-bold">Thông báo mới nhất</span>
                      {unreadCount > 0 && <Badge bg="primary">{unreadCount} mới</Badge>}
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted small">Bạn chưa có thông báo nào</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n._id} 
                            onClick={() => markRead(n._id, n.link)} 
                            className="p-3 border-bottom cursor-pointer"
                            style={{ 
                              borderLeft: !n.isRead ? '4px solid #0d6efd' : '4px solid transparent',
                              backgroundColor: !n.isRead ? '#f0f7ff' : '#fff'
                            }}
                          >
                            <div className={`small mb-1 ${!n.isRead ? "fw-bold text-dark" : "text-secondary"}`}>{n.message}</div>
                            <div className="text-muted" style={{fontSize: '0.7rem'}}>
                              <i className="bi bi-clock me-1"></i>{new Date(n.createdAt).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 text-center border-top bg-light">
                       <Link to="/notifications" className="text-decoration-none small fw-bold">Xem tất cả</Link>
                    </div>
                  </div>
                </NavDropdown>

                {/* THÔNG TIN TÀI KHOẢN */}
                <NavDropdown 
                  title={
                    <span className="text-white fw-bold">
                      <i className="bi bi-person-circle me-1"></i>
                      {currentUser?.username || "Thành viên"}
                    </span>
                  } 
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
                  <NavDropdown.Item onClick={handleLogout} className="text-danger fw-bold">
                    <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary rounded-pill px-4 shadow-sm">
                Đăng nhập
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AuthHeader;