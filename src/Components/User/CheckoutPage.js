import React, { useState, useEffect } from "react";
import { Container, Card, Button, Spinner, Alert, Form, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CheckoutBankPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // State cho thông tin thẻ
    const [cardInfo, setCardInfo] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: ""
    });

    const API_URL = "http://localhost:5000/api";

    // Danh sách ngân hàng với quy định độ dài số tài khoản/số thẻ
    const bankList = [
        { id: "ncb", name: "NCB", logo: "https://inkythuatso.com/uploads/thumbnails/800/2021/12/logo-ncb-inkythuatso-21-10-59-15.jpg", minLen: 16, maxLen: 19 },
        { id: "vcb", name: "Vietcombank", logo: "https://www.inlogo.vn/vnt_upload/File/Image/logo_VCB_828891.jpg", minLen: 10, maxLen: 13 },
        { id: "tcb", name: "Techcombank", logo: "https://ruybangphuonghoang.com/wp-content/uploads/2024/10/logo-techcombank.png", minLen: 12, maxLen: 14 },
        { id: "bidv", name: "BIDV", logo: "https://ruybangphuonghoang.com/wp-content/uploads/2024/10/logo-bidv-invaiphuonghoang.png", minLen: 14, maxLen: 14 },
        { id: "ctg", name: "VietinBank", logo: "https://ruybangphuonghoang.com/wp-content/uploads/2024/10/logo-vietinbank-VECTOR-DEP-2048x1337.jpg", minLen: 12, maxLen: 12 },
        { id: "acb", name: "ACB", logo: "https://ruybangphuonghoang.com/wp-content/uploads/2024/10/acb-2048x973.jpg", minLen: 8, maxLen: 12 },
        { id: "mbb", name: "MBBank", logo: "https://ruybangphuonghoang.com/wp-content/uploads/2024/10/LOGOMBBANK-2048x1234.jpg", minLen: 10, maxLen: 13 },
        { id: "tpbank", name: "TPBank", logo: "https://ruybangphuonghoang.com/wp-content/uploads/2024/10/logo-tpbank-invaiphuonghoang.png", minLen: 11, maxLen: 11 },
        { id: "vpbank", name: "VPBank", logo: "https://ruybangphuonghoang.com/wp-content/uploads/2024/10/vpbank-logo-ruybangphuonghoang.png", minLen: 8, maxLen: 10 },
        { id: "vab", name: "VietA Bank", logo: "https://cdn.haitrieu.com/wp-content/uploads/2023/10/Logo-Ngan-hang-thuong-mai-co-phan-Viet-A-VietABank.png", minLen: 15, maxLen: 15 },
    ];

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get(`${API_URL}/bookings/my-bookings`, { headers: getAuthHeaders() });
                const b = res.data.data.bookings.find((item) => item._id === bookingId);
                setBooking(b);
            } catch (err) {
                setErrorMessage("Không thể tải thông tin đơn hàng.");
            }
        };
        fetchBooking();
    }, [bookingId]);

    const handleSelectBank = (bank) => {
        setSelectedBank(bank);
        setErrorMessage(""); // Xóa lỗi khi đổi ngân hàng
        if (!paymentDetails) createBankPayment();
    };

    const createBankPayment = async () => {
        try {
            const res = await axios.post(`${API_URL}/payments/bank`, { bookingId }, { headers: getAuthHeaders() });
            setPaymentDetails(res.data);
        } catch (err) {
            setErrorMessage("Lỗi kết nối cổng thanh toán.");
        }
    };

    // Hàm kiểm tra tính hợp lệ trước khi gửi
    const validateForm = () => {
        const { cardNumber, cardName, expiryDate } = cardInfo;
        const numOnly = cardNumber.replace(/\s/g, "");

        if (!selectedBank) return false;
        
        if (numOnly.length < selectedBank.minLen || numOnly.length > selectedBank.maxLen) {
            setErrorMessage(`Ngân hàng ${selectedBank.name} yêu cầu STK/Số thẻ từ ${selectedBank.minLen} đến ${selectedBank.maxLen} chữ số.`);
            return false;
        }

        if (!cardName.trim()) {
            setErrorMessage("Vui lòng nhập tên chủ thẻ.");
            return false;
        }

        if (!expiryDate.includes("/")) {
            setErrorMessage("Định dạng ngày phát hành không hợp lệ (MM/YY).");
            return false;
        }

        return true;
    };

    const handleFinalSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await axios.post(`${API_URL}/payments/bank/notify`, { 
                paymentId: paymentDetails.paymentId,
                // Gửi thêm thông tin nếu backend cần lưu vết giao dịch
                cardNumber: cardInfo.cardNumber 
            }, { headers: getAuthHeaders() });
            
            alert("Giao dịch thành công. Xin đợi xác thực!");
            navigate("/payment");
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "Lỗi khi gửi thông báo thanh toán.");
        } finally {
            setLoading(false);
        }
    };

    if (!booking) return <div className="text-center my-5"><Spinner animation="border" /></div>;

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-light p-4 h-100">
                        <h4 className="fw-bold mb-4">Thông tin đơn hàng</h4>
                        <div className="mb-3">
                            <label className="text-muted small">Số tiền thanh toán</label>
                            <h3 className="text-primary fw-bold">{booking.totalPrice.toLocaleString()} <small>VND</small></h3>
                        </div>
                        <div className="mb-3">
                            <label className="text-muted small">Mã đơn hàng</label>
                            <p className="fw-bold">{bookingId.substring(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="mb-3">
                            <label className="text-muted small">Nhà cung cấp</label>
                            <p className="fw-bold">Tourify Travel</p>
                        </div>
                        <hr />
                        <p className="small text-muted">Tour: {booking.tour?.title}</p>
                    </Card>
                </Col>

                <Col md={7}>
                    <Card className="p-4 shadow-sm border-0">
                        {!selectedBank ? (
                            <>
                                <h5 className="mb-4 text-center">Chọn ngân hàng thanh toán</h5>
                                <Row className="g-3">
                                    {bankList.map((bank) => (
                                        <Col xs={4} md={3} key={bank.id}>
                                            <div 
                                                className="bank-logo-item border p-2 text-center rounded shadow-hover"
                                                onClick={() => handleSelectBank(bank)}
                                                style={{ cursor: "pointer", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                <img src={bank.logo} alt={bank.name} style={{ maxWidth: "100%", maxHeight: "40px" }} />
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        ) : (
                            <div className="payment-form">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="mb-0">Thanh toán qua {selectedBank.name}</h5>
                                    <Button variant="link" size="sm" onClick={() => setSelectedBank(null)}>Thay đổi</Button>
                                </div>
                                
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Số thẻ / Số tài khoản</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control 
                                                type="text" 
                                                placeholder={`Nhập ${selectedBank.minLen}-${selectedBank.maxLen} chữ số`}
                                                value={cardInfo.cardNumber}
                                                onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value.replace(/\D/g, "")})}
                                            />
                                            <img src={selectedBank.logo} style={{ width: "35px", position: "absolute", right: "10px", top: "5px" }} alt="logo" />
                                        </div>
                                        <Form.Text className="text-muted small">Ngân hàng yêu cầu: {selectedBank.minLen === selectedBank.maxLen ? selectedBank.minLen : `${selectedBank.minLen}-${selectedBank.maxLen}`} số.</Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Tên chủ thẻ</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Họ Và Tên Ghi Không Dấu" 
                                            value={cardInfo.cardName}
                                            onChange={(e) => setCardInfo({...cardInfo, cardName: e.target.value.toUpperCase()})}
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="small fw-bold">Ngày phát hành</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    placeholder="MM/YY" 
                                                    value={cardInfo.expiryDate}
                                                    onChange={(e) => setCardInfo({...cardInfo, expiryDate: e.target.value})}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <div className="d-flex gap-2">
                                        <Button variant="light" className="w-50 py-2" onClick={() => navigate(-1)}>Hủy</Button>
                                        <Button 
                                            variant="primary" 
                                            className="w-50 py-2" 
                                            onClick={handleFinalSubmit}
                                            disabled={loading}
                                        >
                                            {loading ? <Spinner size="sm" /> : "Xác nhận"}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                        {errorMessage && <Alert variant="danger" className="mt-3 small">{errorMessage}</Alert>}
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CheckoutBankPage;