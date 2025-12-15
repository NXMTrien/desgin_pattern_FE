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
      <a className="navbar-brand d-flex align-items-center" href="#">
            <div className="rounded-circle d-inline-block me-2" style={{width:36, height:36, backgroundColor: 'var(--brand-500)'}}></div>
            <span style={{fontWeight:700, color:'#f0f0f5ff'}}>Tourify</span>
          </a>

      <div className="ms-auto d-flex align-items-center gap-3">
        {token && role === "admin" ? (
          <>
            <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item"><a className="nav-link" href="/tours_admin">Tours Manager</a></li>
              <li className="nav-item"><a className="nav-link" href="/admin_payment">Payment Confirm</a></li>
              <li className="nav-item"><a className="nav-link" href="/manage-users">User Manager</a></li>
            </ul>
          </div>
            
          </>
        ) : token ? (
          <>
  <div className="collapse navbar-collapse" id="navmenu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item"><a className="nav-link" href="/tours-users">Tours</a></li>
              <li className="nav-item"><a className="nav-link" href="/payment">Payment</a></li>
              <li className="nav-item"><a className="nav-link" href="/">Home</a></li>
            </ul>
          </div>
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
