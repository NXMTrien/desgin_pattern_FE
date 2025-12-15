import React from "react";

export default function Footer() {
  return (
    <footer className="py-5" style={{ background: "#f8f9fa" }}>
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 style={{ color: "#0b4a7a" }}>Tourify</h5>
            <p className="text-muted small">
              Đưa bạn đến mọi miền đất nước với trải nghiệm khó quên.
            </p>
          </div>

          <div className="col-md-2 mb-3">
            <h6>Về chúng tôi</h6>
            <ul className="list-unstyled small text-muted">
              <li>Giới thiệu</li>
              <li>Blog</li>
              <li>Liên hệ</li>
            </ul>
          </div>

          <div className="col-md-3 mb-3">
            <h6>Hỗ trợ</h6>
            <ul className="list-unstyled small text-muted">
              <li>FAQ</li>
              <li>Điều khoản</li>
              <li>Chính sách bảo mật</li>
            </ul>
          </div>

          <div className="col-md-3 mb-3">
            <h6>Kết nối</h6>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm">
                Facebook
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                Instagram
              </button>
            </div>
          </div>
        </div>

        <div className="text-center small text-muted mt-4">
          © {new Date().getFullYear()} Tourify. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
