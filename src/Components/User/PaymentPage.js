import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: getAuthHeaders(),
      });
      const all = res.data.data.bookings || [];
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

  const handleCancel = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đặt tour này không?")) {
      try {
        await axios.patch(`${API_URL}/bookings/cancel/${id}`, {}, {
          headers: getAuthHeaders(),
        });
        alert("Hủy tour thành công! Email thông báo đã được gửi.");
        fetchBookings();
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
      {/* CSS CUSTOM CHO NÚT */}
      <style>{`
        .btn-silver {
          background-color: #e0e0e0;
          border: 1px solid #c0c0c0;
          color: #555;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .btn-pay-hover:hover {
          background-color: #28a745 !important; /* Màu xanh success */
          border-color: #28a745 !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
        }

        .btn-cancel-hover:hover {
          background-color: #dc3545 !important; /* Màu đỏ danger */
          border-color: #dc3545 !important;
          color: white !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
        }
      `}</style>

      <h2 className="text-center fw-bold mb-4"> Danh Sách Tour Cần Thanh Toán</h2>

      {message && <Alert variant="danger">{message}</Alert>}

      {bookings.length === 0 ? (
        <Alert variant="info" className="text-center">
          Bạn không có tour nào cần thanh toán.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm align-middle">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Tên Tour</th>
              <th>Ngày Đi</th>
              <th>Số Người</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th style={{ width: "250px" }}>Thao Tác</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b, index) => (
              <tr key={b._id}>
                <td>{index + 1}</td>
                <td className="fw-bold">{b.tour?.title || "Tour Tùy Chọn"}</td>
                <td>{new Date(b.startDate).toLocaleDateString()}</td>
                <td>{b.numberOfPeople}</td>
                <td className="text-primary fw-bold">{b.totalPrice?.toLocaleString()} VNĐ</td>
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
                    <Button variant="secondary" className="w-100 opacity-50" disabled>
                      Đang chờ xác nhận
                    </Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Button
                        className="btn-silver btn-pay-hover flex-fill"
                        onClick={() => handlePayment(b._id)}
                      >
                        Thanh Toán
                      </Button>
                      <Button
                        className="btn-silver btn-cancel-hover flex-fill"
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