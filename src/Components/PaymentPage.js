import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
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

        const all = res.data.data.bookings || [];

        // Chỉ lấy booking chờ thanh toán
        const pending = all.filter((b) =>
          ["pending_payment", "pending","awaiting_confirmation"].includes(b.status)
        );

        setBookings(pending);
      } catch (err) {
        console.error("Error loading bookings:", err);
        setMessage("Không thể tải danh sách tour cần thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handlePayment = (id) => {
    navigate(`/checkout/${id}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="text-center fw-bold mb-4">💳 Danh Sách Tour Cần Thanh Toán</h2>

      {message && <Alert variant="danger">{message}</Alert>}

      {bookings.length === 0 ? (
        <Alert variant="info" className="text-center">
          Bạn không có tour nào cần thanh toán.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Tên Tour</th>
              <th>Ngày Đi</th>
              <th>Số Người</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Thanh Toán</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, index) => (
              <tr key={b._id}>
                <td>{index + 1}</td>

                <td>{b.tour?.title || "Tour Tùy Chọn"}</td>

                <td>{new Date(b.startDate).toLocaleDateString()}</td>

                <td>{b.numberOfPeople}</td>

                <td>{b.totalPrice?.toLocaleString()} VNĐ</td>

                <td>
 {b.status === 'awaiting_confirmation' && (
 <span className="badge bg-info text-dark">
 ⏳ Chờ xác nhận
</span>
 )}
 
 {(b.status === 'pending_payment' || b.status === 'pending') && (
 <span className="badge bg-warning text-dark">
 🕒 Chờ thanh toán
 </span>
 )}
 </td>

               <td>
 {b.status === 'awaiting_confirmation' ? (
 <Button variant="secondary" className="w-100" disabled>
 Đang chờ xác nhận
 </Button>
 ) : (
 <Button
  variant="success"
 className="w-100"
 onClick={() => handlePayment(b._id)}
 >
 Thanh Toán
 </Button>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PaymentPage;
