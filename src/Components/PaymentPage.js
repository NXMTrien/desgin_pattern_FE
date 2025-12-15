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

  // Tách hàm fetch ra để dùng lại sau khi hủy thành công
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: getAuthHeaders(),
      });

      const all = res.data.data.bookings || [];

      // Chỉ lấy booking chờ thanh toán hoặc chờ xác nhận
      const pending = all.filter((b) =>
        ["pending_payment", "pending", "awaiting_confirmation"].includes(b.status)
      );

      setBookings(pending);
    } catch (err) {
      console.error("Error loading bookings:", err);
      setMessage("Không thể tải danh sách tour cần thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = (id) => {
    navigate(`/checkout/${id}`);
  };

  // --- HÀM HỦY BOOKING (MỚI) ---
  const handleCancel = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đặt tour này không?")) {
      try {
        await axios.patch(`${API_URL}/bookings/cancel/${id}`, {}, {
          headers: getAuthHeaders(),
        });
        alert("Hủy tour thành công! Email thông báo đã được gửi.");
        fetchBookings(); // Tải lại danh sách
      } catch (err) {
        console.error("Lỗi khi hủy tour:", err);
        alert(err.response?.data?.message || "Không thể hủy tour lúc này.");
      }
    }
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
              <th>Thao Tác</th>
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
                    <span className="badge bg-info text-dark">⏳ Chờ xác nhận</span>
                  )}
                  {(b.status === 'pending_payment' || b.status === 'pending') && (
                    <span className="badge bg-warning text-dark">🕒 Chờ thanh toán</span>
                  )}
                </td>

                <td>
                  {b.status === 'awaiting_confirmation' ? (
                    /* CHỈ HIỂN THỊ NÚT KHÓA KHI ĐANG XÁC NHẬN */
                    <Button variant="secondary" className="w-100" disabled>
                      Đang chờ xác nhận
                    </Button>
                  ) : (
                    /* HIỂN THỊ CẢ 2 NÚT KHI TRẠNG THÁI CHỜ THANH TOÁN */
                   /* HIỂN THỊ 2 NÚT NẰM NGANG NHAU */
    <div className="d-flex gap-2">
      <Button
        variant="success"
        className="flex-fill"
        onClick={() => handlePayment(b._id)}
      >
        Thanh Toán
      </Button>
      <Button
        variant="danger"
        className="flex-fill"
        onClick={() => handleCancel(b._id)}
      >
        Hủy Tour
      </Button>
    </div>
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