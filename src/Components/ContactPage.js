import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';

const ContactPage = () => {
  const [activeBranch, setActiveBranch] = useState('HCM');

  const branches = [
    { id: 'HCM', name: 'TP.Hồ Chí Minh', address: '123 Đường ABC, Quận 1, TP.HCM', phone: '0123 456 789' },
    { id: 'MB', name: 'Miền Bắc', address: '456 Phố XYZ, Quận Hoàn Kiếm, Hà Nội', phone: '0987 654 321' },
    { id: 'MT', name: 'Miền Trung', address: '789 Đường Lê Lợi, Hải Châu, Đà Nẵng', phone: '0236 123 456' },
    { id: 'TN', name: 'Tây Nguyên', address: '101 Đường Hùng Vương, Pleiku, Gia Lai', phone: '0269 999 888' },
  ];

  return (
    <div className="contact-page py-5" style={{ backgroundColor: '#f8fbff', minHeight: '100vh' }}>
      <style>{`
        .contact-title { color: #0b4a7a; font-weight: 700; margin-bottom: 20px; }
        .branch-btn { cursor: pointer; transition: all 0.3s; border: 1px solid #dee2e6; }
        .branch-btn.active { background-color: #0b4a7a !important; color: white; border-color: #0b4a7a; }
        .info-card { border: none; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .form-label { font-size: 0.9rem; font-weight: 600; }
        .required { color: red; }
      `}</style>

      <Container>
        <div className="text-center mb-5">
          <h2 className="contact-title text-uppercase">Liên hệ</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '800px' }}>
            Để có thể đáp ứng được các yêu cầu và đóng góp ý kiến của quý khách, xin vui lòng gửi thông tin hoặc gọi đến hotline các chi nhánh bên dưới để liên hệ một cách nhanh chóng.
          </p>
        </div>

        <Row className="g-4">
          {/* CỘT TRÁI: FORM LIÊN HỆ */}
          <Col lg={7}>
            <Card className="p-4 info-card">
              <h5 className="fw-bold mb-4 text-uppercase" style={{ fontSize: '1rem' }}>Thông tin liên lạc</h5>
              <Form>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Loại thông tin <span className="required">*</span></Form.Label>
                    <Form.Select>
                      <option>Du lịch</option>
                      <option>Khiếu nại</option>
                      <option>Hợp tác</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Họ tên <span className="required">*</span></Form.Label>
                    <Form.Control type="text" placeholder="Liên hệ" />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Email <span className="required">*</span></Form.Label>
                    <Form.Control type="email" placeholder="Nhập email" />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Điện thoại <span className="required">*</span></Form.Label>
                    <Form.Control type="text" placeholder="Nhập số điện thoại" />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Tên công ty</Form.Label>
                    <Form.Control type="text" placeholder="Nhập tên công ty" />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Số khách</Form.Label>
                    <Form.Control type="number" defaultValue={0} />
                  </Col>
                  <Col md={12} className="mb-3">
                    <Form.Label className="form-label">Nội dung liên hệ <span className="required">*</span></Form.Label>
                    <Form.Control as="textarea" rows={4} placeholder="Nhập nội dung" />
                  </Col>
                </Row>
                <Button variant="primary" className="px-5 fw-bold shadow-sm">GỬI ĐI</Button>
              </Form>
            </Card>
          </Col>

          {/* CỘT PHẢI: CHI NHÁNH */}
          <Col lg={5}>
            <Card className="p-4 info-card h-100">
              <h5 className="fw-bold mb-4 text-uppercase" style={{ fontSize: '1rem' }}>Chi nhánh toàn cầu</h5>
              <div className="d-flex flex-wrap gap-2 mb-4">
                {branches.map((branch) => (
                  <Badge
                    key={branch.id}
                    bg="light"
                    text="dark"
                    className={`branch-btn p-2 px-3 fw-normal ${activeBranch === branch.id ? 'active' : ''}`}
                    onClick={() => setActiveBranch(branch.id)}
                  >
                    {branch.name}
                  </Badge>
                ))}
              </div>

              <div className="branch-detail pt-3 border-top">
                <h6 className="fw-bold text-primary mb-3">TRỤ SỞ CHÍNH</h6>
                <div className="d-flex mb-3">
                  <i className="bi bi-geo-alt-fill me-3 text-secondary"></i>
                  <span>{branches.find(b => b.id === activeBranch)?.address}</span>
                </div>
                <div className="d-flex mb-3">
                  <i className="bi bi-telephone-fill me-3 text-secondary"></i>
                  <span>{branches.find(b => b.id === activeBranch)?.phone}</span>
                </div>
                <div className="d-flex mb-3">
                  <i className="bi bi-envelope-fill me-3 text-secondary"></i>
                  <span>tourify@gmail.com</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ContactPage;