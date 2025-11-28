import React, { useState, useEffect } from "react";
import { Container, Card, Button, Spinner, Alert, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CheckoutBankPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentId, setPaymentId] = useState(null);
  const [message, setMessage] = useState("");

  const API_URL = "http://localhost:5000/api";

  const [paymentMethod, setPaymentMethod] = useState(""); // cash / bank

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  useEffect(() => {
  if (paymentMethod === "bank" && !qrCodeUrl && !loading) {
    createBankPayment();
  }
}, [paymentMethod]);

  // Lấy thông tin booking
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${API_URL}/bookings/my-bookings`, {
          headers: getAuthHeaders(),
        });
        const b = res.data.data.bookings.find(b => b._id === bookingId);
        setBooking(b);
      } catch (err) {
        console.error(err);
        setMessage("Không thể tải thông tin booking.");
      }
    };
    fetchBooking();
  }, [bookingId]);

  const createBankPayment = async () => {
    if (!booking) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/payments/bank`,
        { bookingId: booking._id },
        { headers: getAuthHeaders() }
      );
      setQrCodeUrl(res.data.qrCodeUrl);
      setPaymentId(res.data.paymentId);
      setMessage("Quét QR code để thực hiện thanh toán.");
    } catch (err) {
      console.error(err);
      setMessage("Lỗi khi tạo QR code thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/payments/bank/confirm`,
        { paymentId },
        { headers: getAuthHeaders() }
      );
      alert("✅ Thanh toán thành công!");
      navigate("/payment");
    } catch (err) {
      console.error(err);
      alert("❌ Thanh toán thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return <p>Đang tải thông tin booking...</p>;

  return (
    <Container className="my-4" style={{ maxWidth: "600px" }}>
      <Card className="shadow p-4">
        <h3 className="text-center mb-3">Thanh toán Tour</h3>

        {/* Thông tin khách hàng */}
        <Card className="p-3 mb-3">
          <h5>Thông tin người đặt</h5>
          <p><strong>Họ tên:</strong> {booking.user?.username}</p>
          <p><strong>Email:</strong> {booking.user?.email}</p>
          <p><strong>Số điện thoại:</strong> {booking.user?.phone}</p>
          <p><strong>Số người tham gia:</strong> {booking.numberOfPeople}</p>
          <p><strong>Ngày đi:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>

          <p><strong>Tổng tiền:</strong> {booking.totalPrice.toLocaleString()} VNĐ</p>
        </Card>

        
        <Form.Group className="mb-3">
          <Form.Label><strong>Phương thức thanh toán</strong></Form.Label>
          <Form.Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">-- Chọn phương thức --</option>
            <option value="cash">💵 Tiền mặt</option>
            <option value="bank">🏦 Chuyển khoản (QR VNPAY)</option>
          </Form.Select>
        </Form.Group>

        {message && <Alert variant="info">{message}</Alert>}

        {/* Nếu chọn tiền mặt */}
        {paymentMethod === "cash" && (
          <Button className="w-100" onClick={() => navigate("/payment")}>
            Xác nhận thanh toán tiền mặt
          </Button>
        )}

        {paymentMethod === "bank" && (
  <>
    {!qrCodeUrl ? (
      <div className="text-center my-3">
        <Spinner animation="border" />
        <p>Đang tạo mã QR thanh toán...</p>
      </div>
    ) : (
      <>
        <div className="text-center mb-3">
          <img src={qrCodeUrl} alt="QR Code" style={{ width: "250px" }} />
        </div>

        <p><strong>Ngân hàng:</strong> NCB</p>
        <p><strong>Số tài khoản:</strong> 9704198526191432198</p>
        <p><strong>Tên chủ tài khoản:</strong> Công ty Tourify</p>
        <p><strong>Số tiền:</strong> {booking.totalPrice.toLocaleString()} VNĐ</p>

        <Button className="w-100" onClick={confirmPayment} disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Xác nhận đã chuyển khoản"}
        </Button>
      </>
    )}
  </>
)}
      </Card>
    </Container>
  );
};

export default CheckoutBankPage;
