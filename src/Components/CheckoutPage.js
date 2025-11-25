import React, { useState, useEffect } from "react";
import { Container, Card, Button, Spinner, Alert } from "react-bootstrap";
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

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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
      setMessage("Quét QR code hoặc chuyển khoản theo thông tin dưới đây.");
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
      <Card className="shadow p-3">
        <h3 className="text-center mb-3">Thanh toán QR VNPAY Free</h3>
        {message && <Alert variant="info">{message}</Alert>}

        {!qrCodeUrl ? (
          <Button className="w-100" onClick={createBankPayment} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Tạo QR code & thông tin chuyển khoản"}
          </Button>
        ) : (
          <>
            <div className="text-center mb-3">
              <img src={qrCodeUrl} alt="QR Code" style={{ width: "250px" }} />
            </div>
            <p><strong>Ngân hàng:</strong> Techcombank</p>
            <p><strong>Số tài khoản:</strong> 123456789</p>
            <p><strong>Tên chủ tài khoản:</strong> Công ty Tourify</p>
            <p><strong>Số tiền:</strong> {booking.totalPrice.toLocaleString()} VNĐ</p>

            <Button className="w-100" onClick={confirmPayment} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Xác nhận đã chuyển khoản"}
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
};

export default CheckoutBankPage;
