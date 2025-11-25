import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const API_URL = "http://localhost:5000/api";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/bookings/my-bookings`, {
          headers: getAuthHeaders(),
        });
        const allBookings = res.data.data.bookings || [];
        const pendingBookings = allBookings.filter(
          (b) => ["pending_payment", "pending"].includes(b.status)
        );
        setBookings(pendingBookings);
      } catch (error) {
        console.error("Lỗi khi tải danh sách booking:", error);
        setMessage("Không thể tải danh sách tour đã đặt.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handlePayment = (bookingId) => {
    navigate(`/checkout/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Đang tải dữ liệu thanh toán...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="text-center fw-bold mb-4">💳 Trang Thanh Toán Tour</h2>
      {message && <Alert variant="danger">{message}</Alert>}
      {bookings.length === 0 ? (
        <Alert variant="info" className="text-center">
          Bạn chưa có tour nào cần thanh toán.
        </Alert>
      ) : (
        <Row>
          {bookings.map((booking) => (
            <Col md={4} sm={6} xs={12} key={booking._id} className="mb-4">
              <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "12px" }}>
                {booking.tour?.image && (
                  <Card.Img
                    variant="top"
                    src={booking.tour.image}
                    alt={booking.tour?.title}
                    style={{ height: "220px", objectFit: "cover" }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{booking.tour?.title}</Card.Title>
                  <Card.Text>
                    <strong>Tour:</strong> {booking.tour?.title || booking.customTour?.title || "Chuyến Đi Tự Chọn Của Bạn"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Điểm đến:</strong> {booking.tour?.destination || booking.customTour?.destination || "Chưa Rõ"}
                  </Card.Text>
                  <Card.Text>
                    <strong>Ngày khởi hành:</strong> {new Date(booking.startDate).toLocaleDateString()}
                  </Card.Text>
                  <Card.Text>
                    <strong>Số người:</strong> {booking.numberOfPeople}
                  </Card.Text>
                  <Card.Text>
                    <strong>Tổng tiền:</strong> {booking.totalPrice?.toLocaleString()} VNĐ
                  </Card.Text>
                  <Card.Text>
                    <span className="badge bg-warning text-dark">Chờ thanh toán</span>
                  </Card.Text>
                  <Button
                    variant="success"
                    className="w-100"
                    onClick={() => handlePayment(booking._id)}
                  >
                    Thanh Toán Ngay
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default PaymentPage;
