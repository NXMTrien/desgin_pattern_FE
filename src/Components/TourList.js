import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

const TourList = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api'; 

 const navigate = useNavigate();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await axios.get(`${API_URL}/tours`);
        setTours(res.data.data.tours || []);
      } catch (error) {
        console.error('Lỗi khi tải tour:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // Xử lý đặt tour
  const handleBooking = async (tourId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập trước khi đặt tour!');
      return;
    }

    const numberOfPeople = prompt('Nhập số người tham gia:');
    const startDate = prompt('Nhập ngày khởi hành (yyyy-mm-dd):');
    if (!numberOfPeople || !startDate) return;

    try {
      const res = await axios.post(
        `${API_URL}/bookings`,
        { tour: tourId, numberOfPeople, startDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || 'Đặt tour thành công!');
      navigate("/payment");
    } catch (error) {
      alert(error.response?.data?.message || 'Đặt tour thất bại');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải danh sách tour...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4 fw-bold">Danh Sách Tour Du Lịch</h2>
      <Row>
        {tours.length === 0 ? (
          <p className="text-center">Không có tour nào trong hệ thống.</p>
        ) : (
          tours.map((tour) => (
            <Col md={4} sm={6} xs={12} key={tour._id} className="mb-4">
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: '12px' }}>
                {tour.image && (
                  <Card.Img
                    variant="top"
                    src={tour.image}
                    alt={tour.name}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{tour.title}</Card.Title>
                  <Card.Text>
                    <strong>Điểm đến:</strong> {tour.destination || 'Chưa cập nhật'}
                  </Card.Text>
                  <Card.Text>
                    {tour.description?.length > 100
                      ? `${tour.description.slice(0, 100)}...`
                      : tour.description}
                  </Card.Text>
                  <Card.Text>
                    <strong>Giá:</strong> {tour.price?.toLocaleString()} VNĐ
                  </Card.Text>
                  <Button
                    variant="primary"
                    onClick={() => handleBooking(tour._id)}
                    className="w-100"
                  >
                    Booking Tour
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
      <div className="text-center mb-4">
        <p className="text-muted">
          Nếu bạn muốn có những <strong>tour tự do</strong> phù hợp theo ý mình,{' '}
          <Button
            variant="link"
            className="p-0 fw-bold text-decoration-none"
            onClick={() => navigate('/custom-tour')}
          >
            hãy nhấn vào đây
          </Button>
          .
        </p>
      </div>
    </Container>
  );
};

export default TourList;
