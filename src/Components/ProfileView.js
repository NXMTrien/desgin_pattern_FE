import React from 'react';
import { User, LogOut } from 'lucide-react';

export default function ProfileView({ currentUser, onLogout, onClose }) {
  return (
    <div className="text-center p-4">
      <div className="d-flex justify-content-between align-items-start mb-4">
        <h2 className="fs-3 fw-bold text-dark">Thông tin Tài khoản</h2>
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
      </div>
      <div className="d-flex justify-content-center mb-4">
        <div className="bg-success-subtle p-3 rounded-circle d-inline-flex">
          <User size={48} className="text-success" />
        </div>
      </div>
      <div className="d-grid gap-3 text-start">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <p className="text-muted mb-0" style={{fontSize: '0.75rem', fontWeight: 600}}>Tên người dùng</p>
            <p className="fs-5 fw-medium text-dark mb-0">{currentUser?.username || "Không có tên"}</p>
          </div>
        </div>
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <p className="text-muted mb-0" style={{fontSize: '0.75rem', fontWeight: 600}}>Email</p>
            <p className="fs-5 fw-medium text-dark mb-0">{currentUser?.email}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="btn btn-danger w-100 d-flex items-center justify-content-center mt-4 fw-medium"
      >
        <LogOut className="me-2" size={20} /> Đăng xuất
      </button>
    </div>
  );
}
