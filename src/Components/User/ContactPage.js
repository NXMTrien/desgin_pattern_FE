import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const ContactPage = () => {
  const [activeBranch, setActiveBranch] = useState('HCM');
  
  // 1. Quản lý dữ liệu Form
  const [formData, setFormData] = useState({
    type: 'Du lịch',
    fullName: '',
    email: '',
    phone: '',
    company: '',
    numberOfGuests: 0,
    message: ''
  });

  // 2. Quản lý trạng thái gửi (Loading, Thành công, Lỗi)
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const branches = [
    { id: 'HCM', name: 'TP.Hồ Chí Minh', address: '123 Đường ABC, Quận 1, TP.HCM', phone: '0123 456 789' },
    { id: 'MB', name: 'Miền Bắc', address: '456 Phố XYZ, Quận Hoàn Kiếm, Hà Nội', phone: '0987 654 321' },
    { id: 'MT', name: 'Miền Trung', address: '789 Đường Lê Lợi, Hải Châu, Đà Nẵng', phone: '0236 123 456' },
    { id: 'TN', name: 'Tây Nguyên', address: '101 Đường Hùng Vương, Pleiku, Gia Lai', phone: '0269 999 888' },
  ];

  // Hàm xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Hàm gửi dữ liệu lên Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      // Thay đổi URL này thành URL API thật của bạn
      const response = await axios.post('http://localhost:5000/api/contacts', formData);
      
      if (response.data.status === 'success') {
        setStatus({ type: 'success', msg: '✅ Cảm ơn bạn! Phản hồi của bạn đã được gửi thành công.' });
        // Reset form sau khi gửi thành công
        setFormData({
          type: 'Du lịch', fullName: '', email: '', phone: '', company: '', numberOfGuests: 0, message: ''
        });
      }
    } catch (error) {
      console.error(error);
      setStatus({ 
        type: 'danger', 
        msg: '❌ Có lỗi xảy ra: ' + (error.response?.data?.message || 'Không thể kết nối đến máy chủ.') 
      });
    } finally {
      setLoading(false);
    }
  };

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
            Để có thể đáp ứng được các yêu cầu và đóng góp ý kiến của quý khách, xin vui lòng gửi thông tin hoặc gọi đến hotline các chi nhánh bên dưới.
          </p>
        </div>

        <Row className="g-4">
          <Col lg={7}>
            <Card className="p-4 info-card">
              <h5 className="fw-bold mb-4 text-uppercase" style={{ fontSize: '1rem' }}>Thông tin liên lạc</h5>
              
              {/* Hiển thị thông báo trạng thái */}
              {status.msg && <Alert variant={status.type} onClose={() => setStatus({type:'', msg:''})} dismissible>{status.msg}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Loại thông tin <span className="required">*</span></Form.Label>
                    <Form.Select name="type" value={formData.type} onChange={handleChange}>
                      <option value="Du lịch">Du lịch</option>
                      <option value="Khiếu nại">Khiếu nại</option>
                      <option value="Hợp tác">Hợp tác</option>
                    </Form.Select>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Họ tên <span className="required">*</span></Form.Label>
                    <Form.Control 
                      name="fullName"
                      required
                      type="text" 
                      placeholder="Nhập họ tên" 
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Email <span className="required">*</span></Form.Label>
                    <Form.Control 
                      name="email"
                      required
                      type="email" 
                      placeholder="Nhập email" 
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label">Điện thoại <span className="required">*</span></Form.Label>
                    <Form.Control 
                      name="phone"
                      required
                      type="text" 
                      placeholder="Nhập số điện thoại" 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Col>

                 
                  <Col md={12} className="mb-3">
                    <Form.Label className="form-label">Nội dung liên hệ <span className="required">*</span></Form.Label>
                    <Form.Control 
                      name="message"
                      required
                      as="textarea" 
                      rows={4} 
                      placeholder="Nhập nội dung" 
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="px-5 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> ĐANG GỬI...
                    </>
                  ) : 'GỬI PHẢN HỒI'}
                </Button>
              </Form>
            </Card>
          </Col>

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
                <h6 className="fw-bold text-primary mb-3">THÔNG TIN CHI NHÁNH</h6>
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