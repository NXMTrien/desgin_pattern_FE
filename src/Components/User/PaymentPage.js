import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Button, Spinner, Alert, Modal } from "react-bootstrap"; // Thêm Modal
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  // --- States mới cho giao diện thông báo (thay thế alert/confirm) ---
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: "", body: "", action: null, type: "info" });
  
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const newSocket = io(API_URL, {
      auth: { token: localStorage.getItem("token") }
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [API_URL]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/bookings/my-bookings`, {
        headers: getAuthHeaders(),
      });
      const all = res.data.data.bookings || [];
      const pending = all.filter((b) =>
        ["pending_payment", "pending", "awaiting_confirmation"].includes(b.status)
      );
      setBookings(pending);
    } catch (err) {
      setMessage("Không thể tải danh sách tour cần thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 1. Thay thế alert chuyển hướng thanh toán
  const handlePayment = (booking) => {
    if (socket) {
      socket.emit("client_starting_payment", {
        bookingId: booking._id,
        tourTitle: booking.tour?.title
      });
    }

    setModalConfig({
      title: "Chuyển hướng thanh toán",
      body: `Hệ thống đang chuyển hướng bạn đến trang thanh toán cho tour: ${booking.tour?.title}`,
      type: "success",
      action: () => navigate(`/checkout/${booking._id}`) // Thực hiện chuyển hướng khi nhấn OK
    });
    setShowModal(true);
  };

  // 2. Thay thế window.confirm bằng Modal
  const handleCancelClick = (id) => {
    setModalConfig({
      title: "Xác nhận hủy tour",
      body: "Bạn có chắc chắn muốn hủy đặt tour này không? Hành động này không thể hoàn tác.",
      type: "danger",
      action: () => executeCancel(id) // Gọi hàm xử lý hủy thực tế
    });
    setShowModal(true);
  };

  const executeCancel = async (id) => {
    setShowModal(false); // Đóng modal trước khi xử lý
    try {
      await axios.patch(`${API_URL}/api/bookings/cancel/${id}`, {}, {
        headers: getAuthHeaders(),
      });
      
      if (socket) {
        socket.emit("cancel_booking", { bookingId: id });
      }

      setMessage("Hủy tour thành công!");
      fetchBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || "Không thể hủy tour lúc này.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <Container className="my-4">
      <style>{`
        .btn-silver { background-color: #e0e0e0; border: 1px solid #c0c0c0; color: #555; transition: all 0.3s ease; font-weight: 500; }
        .btn-pay-hover:hover { background-color: #28a745 !important; border-color: #28a745 !important; color: white !important; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3); }
        .btn-cancel-hover:hover { background-color: #dc3545 !important; border-color: #dc3545 !important; color: white !important; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3); }
        .modal-confirm { border-radius: 15px; overflow: hidden; }
      `}</style>

      <h2 className="text-center fw-bold mb-4"> Danh Sách Tour Cần Thanh Toán</h2>

      {message && <Alert variant={message.includes("thành công") ? "success" : "danger"} onClose={() => setMessage("")} dismissible>{message}</Alert>}

      {bookings.length === 0 ? (
        <Alert variant="info" className="text-center py-4 shadow-sm">
          <i className="bi bi-info-circle me-2"></i>
          Bạn không có tour nào cần thanh toán hiện tại.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="shadow-sm align-middle bg-white">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Tên Tour</th>
              <th>Ngày Đi</th>
              <th>Số Người</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th style={{ width: "280px" }}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, index) => (
              <tr key={b._id}>
                <td>{index + 1}</td>
                <td className="fw-bold">{b.tour?.title || "Tour Tùy Chọn"}</td>
                <td>{new Date(b.startDate).toLocaleDateString('vi-VN')}</td>
                <td>{b.numberOfPeople}</td>
                <td className="text-primary fw-bold">{b.totalPrice?.toLocaleString()} VNĐ</td>
                <td>
                  {b.status === 'awaiting_confirmation' && (
                    <span className="badge bg-info text-dark border"><i className="bi bi-hourglass-split me-1"></i> Chờ xác nhận</span>
                  )}
                  {(b.status === 'pending_payment' || b.status === 'pending') && (
                    <span className="badge bg-warning text-dark border"><i className="bi bi-clock-history me-1"></i> Chờ thanh toán</span>
                  )}
                </td>
                <td>
                  {b.status === 'awaiting_confirmation' ? (
                    <Button variant="secondary" className="w-100 opacity-75" disabled>
                      Đang xử lý...
                    </Button>
                  ) : (
                    <div className="d-flex gap-2">
                      <Button className="btn-silver btn-pay-hover flex-fill" onClick={() => handlePayment(b)}>
                        Thanh Toán
                      </Button>
                      <Button className="btn-silver btn-cancel-hover flex-fill" onClick={() => handleCancelClick(b._id)}>
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

      {/* --- ĐÂY LÀ FORM THÔNG BÁO THAY THẾ CHO LOCALHOST:8000 --- */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered 
        className="modal-confirm"
      >
        <Modal.Header closeButton className={`bg-${modalConfig.type} text-white`}>
          <Modal.Title className="fs-5 fw-bold">{modalConfig.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-center">
          <p className="mb-0 fs-6">{modalConfig.body}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pb-4">
          <Button variant="light" className="px-4" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          {modalConfig.action && (
            <Button 
              variant={modalConfig.type} 
              className="px-4" 
              onClick={() => {
                modalConfig.action();
                setShowModal(false);
              }}
            >
              Xác nhận
            </Button>
          )}
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default PaymentPage;