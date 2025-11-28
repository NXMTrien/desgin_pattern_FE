import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Card, Button,
  Spinner, Modal, Form, Alert
} from 'react-bootstrap';

const TourList = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  const [form, setForm] = useState({
    numberOfPeople: "",
    startDate: "",
    endDate: ""
  });

  const [errors, setErrors] = useState("");

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

  // Tính ngày kết thúc
  const calculateEndDate = (start, duration) => {
    if (!start || !duration) return "";
    const date = new Date(start);
    date.setDate(date.getDate() + (duration - 1)); // chuẩn "3 ngày 2 đêm"
    return date.toISOString().split("T")[0];
  };

  // Bấm booking tour
  const openBookingForm = (tour) => {
    setSelectedTour(tour);
    setForm({
      numberOfPeople: "",
      startDate: "",
      endDate: ""
    });
    setErrors("");
    setShowModal(true);
  };

  // Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    let updatedForm = { ...form, [name]: value };

    if (name === "startDate" && selectedTour?.duration) {
      updatedForm.endDate = calculateEndDate(value, selectedTour.duration);
    }

    setForm(updatedForm);
  };

  // Gửi booking
  const handleConfirmBooking = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập!");

    // Validate
    if (!form.numberOfPeople || !form.startDate) {
      return setErrors("Vui lòng nhập đầy đủ thông tin.");
    }

    const maxSize = selectedTour?.maxGroupSize || 100;
    if (parseInt(form.numberOfPeople) > maxSize) {
      return setErrors(`Số người tối đa cho tour này là ${maxSize}.`);
    }

    try {
      const res = await axios.post(
        `${API_URL}/bookings`,
        {
          tour: selectedTour._id,
          numberOfPeople: Number(form.numberOfPeople),
          startDate: form.startDate,

          // 🔥 VNPAY PHẢI GỬI bankCode + language
          bankCode: "",
          language: "vn"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Đặt tour thành công!");
      setShowModal(false);
      navigate("/payment");

    } catch (error) {
      setErrors(error.response?.data?.message || "Đặt tour thất bại");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Đang tải danh sách tour...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="text-center mb-4 fw-bold">Danh Sách Tour Du Lịch</h2>

      <Row>
        {tours.length === 0 ? (
          <p className="text-center">Không có tour nào.</p>
        ) : (
          tours.map((tour) => (
            <Col md={4} key={tour._id} className="mb-4">
              <Card className="shadow-sm border-0 h-100">
                {tour.imageCover && (
                  <Card.Img
                    variant="top"
                    src={`http://localhost:5000/img/tours/${tour.imageCover}`}
                    alt={tour.name}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{tour.title}</Card.Title>
                  <Card.Text>
                    <strong>Điểm đến:</strong> {tour.destination}
                  </Card.Text>
                  <Card.Text>
                    <strong>Giá:</strong> {tour.price?.toLocaleString()} VNĐ
                  </Card.Text>

                  <Button className="w-100" onClick={() => openBookingForm(tour)}>
                    Booking Tour
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* MODAL BOOKING */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đặt Tour: {selectedTour?.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errors && <Alert variant="danger">{errors}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Số người tham gia</Form.Label>
              <Form.Control
                type="number"
                name="numberOfPeople"
                value={form.numberOfPeople}
                onChange={handleChange}
                placeholder={`Tối đa ${selectedTour?.maxGroupSize || 100} người`}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày khởi hành</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày kết thúc</Form.Label>
              <Form.Control type="date" value={form.endDate} disabled />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleConfirmBooking}>
            Xác nhận đặt tour
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TourList;
