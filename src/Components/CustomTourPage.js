import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';

const API_URL = 'http://localhost:5000/api/custom-tours';

const CustomTourPage = () => {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    duration: '',
    transportation: '',
    accommodation: '',
    activities: ''
  });
  const [customTour, setCustomTour] = useState(null);
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('success');

  const token = localStorage.getItem('token');

  // ✅ Hàm tính ngày kết thúc dự kiến
  const calculateEndDate = () => {
    if (!formData.startDate || !formData.duration) return '';
    const start = new Date(formData.startDate);
    start.setDate(start.getDate() + Number(formData.duration));
    return start.toISOString().split('T')[0];
  };

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gửi yêu cầu tour tùy chỉnh
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const activitiesArray = formData.activities
        .split(',')
        .map((act) => act.trim())
        .filter(Boolean);

      const res = await axios.post(
        `${API_URL}`,
        {
          destination: formData.destination,
          startDate: formData.startDate,
          duration: formData.duration,
          transportation: formData.transportation,
          accommodation: formData.accommodation,
          activities: activitiesArray
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage(res.data.message || 'Yêu cầu tour tùy chỉnh đã được gửi!');
      setAlertType('success');
      setFormData({
        destination: '',
        startDate: '',
        duration: '',
        transportation: '',
        accommodation: '',
        activities: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể gửi yêu cầu!');
      setAlertType('danger');
    }
  };

  // Xem tour định sẵn
  const handlePredefinedTour = async (type) => {
    try {
      const res = await axios.get(`${API_URL}/predefined?type=${type}`);
      setCustomTour(res.data.data.customTour);
      setMessage(`Đã tạo tour định sẵn loại ${type}!`);
      setAlertType('info');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Không thể lấy tour định sẵn!');
      setAlertType('danger');
    }
  };

  const endDate = calculateEndDate();

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4 fw-bold">Tạo Tour Du Lịch Tùy Chỉnh</h2>

      {message && <Alert variant={alertType}>{message}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="p-4 shadow-sm border-0 mb-4">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Điểm đến</Form.Label>
                <Form.Control
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="Ví dụ: Đà Lạt, Phú Quốc..."
                  required
                />
              </Form.Group>

             
              <Form.Group className="mb-3">
  <Form.Label>Ngày khởi hành</Form.Label>
  <Form.Control
    type="date"
    name="startDate"
    value={formData.startDate}
    onChange={handleChange}
    required
  />
</Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Số ngày</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Ví dụ: 3"
                  min="1"
                  required
                />
              </Form.Group>

              {/* ✅ Hiển thị ngày kết thúc dự kiến */}
              {endDate && (
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc dự kiến:</Form.Label>
                  <Form.Control type="text" value={endDate} readOnly />
                </Form.Group>
              )}
               <Form.Group className="mb-3">
  <Form.Label>Số lượng người</Form.Label>
  <Form.Control
    type="number"
    name="numberOfPeople"
    value={formData.numberOfPeople}
    onChange={handleChange}
    min="1"
    required
  />
</Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phương tiện di chuyển</Form.Label>
                <Form.Control
                  type="text"
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleChange}
                  placeholder="Máy bay, xe khách, tàu hỏa..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Khách sạn / Nơi ở</Form.Label>
                <Form.Control
                  type="text"
                  name="accommodation"
                  value={formData.accommodation}
                  onChange={handleChange}
                  placeholder="Resort 5 sao, khách sạn 3 sao..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hoạt động (cách nhau bằng dấu phẩy)</Form.Label>
                <Form.Control
                  type="text"
                  name="activities"
                  value={formData.activities}
                  onChange={handleChange}
                  placeholder="Leo núi, tham quan chợ đêm, ăn đặc sản..."
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Gửi yêu cầu tour
              </Button>
            </Form>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="p-4 shadow-sm border-0 mb-4">
            <h5 className="fw-bold mb-3">Tour định sẵn</h5>
            <div className="d-flex gap-3 mb-3">
              <Button variant="success" onClick={() => handlePredefinedTour('adventure')}>
                Tour Mạo Hiểm
              </Button>
              <Button variant="warning" onClick={() => handlePredefinedTour('luxury')}>
                Tour Sang Trọng
              </Button>
            </div>

            {customTour && (
              <div className="mt-3">
                <h6>Thông tin tour:</h6>
                <ul>
                  <li><strong>Điểm đến:</strong> {customTour.destination}</li>
                  <li><strong>Thời lượng:</strong> {customTour.durationDays} ngày</li>
                  <li><strong>Phương tiện:</strong> {customTour.transportation}</li>
                  <li><strong>Khách sạn:</strong> {customTour.accommodation}</li>
                  <li><strong>Hoạt động:</strong> {customTour.activities.join(', ')}</li>
                  <li><strong>Giá ước tính:</strong> {customTour.estimatedPrice.toLocaleString()} VNĐ</li>
                </ul>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomTourPage;
