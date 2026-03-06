import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Container, Table, Button, Spinner, Alert, Modal, Card, Row, Col, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const CheckoutBankPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // State OTP 6 ô
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const inputRefs = useRef([]);

    // --- State cho Modal thông báo ---
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusConfig, setStatusConfig] = useState({ title: "", body: "", variant: "success", success: false });

    const [cardInfo, setCardInfo] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: ""
    });

    const API_URL = process.env.REACT_APP_API_URL;

    // Danh sách ngân hàng (giữ nguyên của bạn)
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
                const res = await axios.get(`${API_URL}/api/bookings/my-bookings`, { headers: getAuthHeaders() });
                const b = res.data.data.bookings.find((item) => item._id === bookingId);
                setBooking(b);
            } catch (err) {
                setErrorMessage("Không thể tải thông tin đơn hàng.");
            }
        };
        fetchBooking();
    }, [bookingId, API_URL]);

    const handleSelectBank = (bank) => {
        setSelectedBank(bank);
        setErrorMessage("");
        if (!paymentDetails) createBankPayment();
    };

    const createBankPayment = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/payments/bank`, { bookingId }, { headers: getAuthHeaders() });
            setPaymentDetails(res.data);
        } catch (err) {
            setErrorMessage("Lỗi kết nối cổng thanh toán.");
        }
    };

    const validateForm = () => {
        const { cardNumber, cardName, expiryDate } = cardInfo;
        const numOnly = cardNumber.replace(/\s/g, "");
        if (!selectedBank) return false;
        if (numOnly.length < selectedBank.minLen || numOnly.length > selectedBank.maxLen) {
            setErrorMessage(`Số thẻ không hợp lệ cho ngân hàng ${selectedBank.name}.`);
            return false;
        }
        if (!cardName.trim()) { setErrorMessage("Vui lòng nhập tên chủ thẻ."); return false; }
        if (!expiryDate.includes("/")) { setErrorMessage("Định dạng ngày (MM/YY) không hợp lệ."); return false; }
        return true;
    };

    const handleFinalSubmit = async () => {
        if (!validateForm()) return;
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/payments/bank/notify`, { 
                paymentId: paymentDetails.paymentId,
                cardNumber: cardInfo.cardNumber 
            }, { headers: getAuthHeaders() });
            
            setIsOtpStep(true); 
            setErrorMessage("");
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "Thông tin thẻ không chính xác.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // --- Thay đổi alert thanh toán thành Modal ---
    const handleVerifyOtp = async () => {
        const otpString = otp.join("");
        if (otpString.length < 6) {
            setErrorMessage("Vui lòng nhập đủ mã OTP (6 chữ số).");
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/payments/bank/verify-otp`, { 
                paymentId: paymentDetails.paymentId,
                otp: otpString 
            }, { headers: getAuthHeaders() });

            // HIỂN THỊ MODAL THÀNH CÔNG
            setStatusConfig({
                title: "Thanh toán thành công",
                body: "Cảm ơn quý khách! Đơn hàng của bạn đã được thanh toán thành công. Hệ thống sẽ đưa bạn về danh sách tour.",
                variant: "success",
                success: true
            });
            setShowStatusModal(true);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn.");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowStatusModal(false);
        if (statusConfig.success) {
            navigate("/payment"); // Chỉ chuyển hướng nếu thanh toán thành công
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
                                                className="bank-logo-item border p-2 text-center rounded"
                                                onClick={() => handleSelectBank(bank)}
                                                style={{ cursor: "pointer", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            >
                                                <img src={bank.logo} alt={bank.name} style={{ maxWidth: "100%", maxHeight: "40px" }} />
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </>
                        ) : isOtpStep ? (
                            <div className="otp-section text-center py-4">
                                <h5 className="mb-3">Xác thực OTP</h5>
                                <p className="text-muted small mb-4">Mã xác thực đã được gửi đến số điện thoại của bạn</p>
                                <div className="d-flex justify-content-center gap-2 mb-4">
                                    {otp.map((digit, index) => (
                                        <Form.Control
                                            key={index}
                                            type="text"
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e, index)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                            className="text-center fw-bold fs-4"
                                            style={{ width: "45px", height: "55px", border: "2px solid #ced4da" }}
                                        />
                                    ))}
                                </div>
                                <div className="d-flex gap-2 justify-content-center">
                                    <Button variant="light" className="px-4" onClick={() => setIsOtpStep(false)}>Quay lại</Button>
                                    <Button variant="primary" className="px-4" onClick={handleVerifyOtp} disabled={loading}>
                                        {loading ? <Spinner size="sm" /> : "Xác nhận OTP"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="payment-form">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="mb-0">Thanh toán qua {selectedBank.name}</h5>
                                    <Button variant="link" size="sm" onClick={() => setSelectedBank(null)}>Thay đổi</Button>
                                </div>
                                <Form>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Số thẻ / Số tài khoản</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder={`Nhập số thẻ/STK`}
                                            value={cardInfo.cardNumber}
                                            onChange={(e) => setCardInfo({...cardInfo, cardNumber: e.target.value.replace(/\D/g, "")})}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Tên chủ thẻ</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="NGUYEN VAN A" 
                                            value={cardInfo.cardName}
                                            onChange={(e) => setCardInfo({...cardInfo, cardName: e.target.value.toUpperCase()})}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold">Ngày phát hành (MM/YY)</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="01/24" 
                                            value={cardInfo.expiryDate}
                                            onChange={(e) => setCardInfo({...cardInfo, expiryDate: e.target.value})}
                                        />
                                    </Form.Group>
                                    <div className="d-flex gap-2">
                                        <Button variant="light" className="w-50" onClick={() => navigate(-1)}>Hủy</Button>
                                        <Button variant="primary" className="w-50" onClick={handleFinalSubmit} disabled={loading}>
                                            {loading ? <Spinner size="sm" /> : "Tiếp tục"}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
                        )}
                        {errorMessage && <Alert variant="danger" className="mt-3 small">{errorMessage}</Alert>}
                    </Card>
                </Col>
            </Row>

            {/* MODAL THAY THẾ CHO ALERT LOCALHOST */}
            <Modal show={showStatusModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton className={`bg-${statusConfig.variant} text-white`}>
                    <Modal.Title className="fs-5">{statusConfig.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        {statusConfig.success ? (
                             <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
                        ) : (
                             <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: "3rem" }}></i>
                        )}
                    </div>
                    <p className="mb-0">{statusConfig.body}</p>
                </Modal.Body>
                <Modal.Footer className="justify-content-center border-0">
                    <Button variant={statusConfig.variant} className="px-5" onClick={handleCloseModal}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CheckoutBankPage;