import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
// Đảm bảo bạn có file CSS hoặc dùng các class Bootstrap tương ứng
import "../css/VerifyEmailForm.css"; 

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = reset

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef([]);

    
    const primaryBlue = "#0054a5";
    const primaryRed = "#e32119";

    const handleChangeOtp = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && index > 0 && otp[index] === "") {
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            inputRefs.current[index - 1].focus();
        }
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        if (!email) return setError("Vui lòng nhập email.");
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
            setSuccess(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Không thể gửi mã.");
        } finally { setLoading(false); }
    };

    const verifyOtp = (e) => {
        e.preventDefault();
        const finalOtp = otp.join("");
        if (finalOtp.length !== 6) return setError("Vui lòng nhập đủ 6 chữ số OTP.");
        setStep(3);
        setSuccess("Mã OTP hợp lệ! Hãy đặt mật khẩu mới.");
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp.");
        setLoading(true);
        try {
            const finalOtp = otp.join("");
            const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
                email, otp: finalOtp, newPassword
            });
            setSuccess(res.data.message);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Thất bại.");
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-wrapper d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>

            {/* Card Content */}
            <div className="card border-0 shadow-sm p-4" style={{ width: "100%", maxWidth: "450px", borderRadius: "15px" }}>
                <h2 className="text-center mb-4 fw-bold" style={{ color: primaryBlue }}>
                    {step === 1 ? "Quên mật khẩu" : step === 2 ? "Xác thực OTP" : "Mật khẩu mới"}
                </h2>

                {error && <div className="alert alert-danger py-2 small">{error}</div>}
                {success && <div className="alert alert-success py-2 small">{success}</div>}

                {/* STEP 1: NHẬP EMAIL */}
                {step === 1 && (
                    <form onSubmit={sendOtp}>
                        <div className="mb-4">
                            <label className="form-label small fw-bold">Email đăng ký <span className="text-danger">*</span></label>
                            <input
                                type="email"
                                className="form-control border-0 border-bottom rounded-0 px-0 shadow-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                required
                            />
                        </div>
                        <button 
                            className="btn w-100 fw-bold text-white py-2 mb-3" 
                            style={{ backgroundColor: primaryRed, borderRadius: "10px" }}
                            disabled={loading}
                        >
                            {loading ? "ĐANG GỬI..." : "GỬI MÃ ĐẶT LẠI"}
                        </button>
                    </form>
                )}

                {/* STEP 2: NHẬP OTP */}
                {step === 2 && (
                    <form onSubmit={verifyOtp}>
                        <p className="text-center small text-muted mb-4">
                            Mã OTP đã được gửi đến: <br/> <strong>{email}</strong>
                        </p>
                        <div className="d-flex justify-content-between mb-4 gap-2">
                            {otp.map((d, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="form-control text-center fw-bold"
                                    style={{ height: "50px", borderRadius: "8px" }}
                                    value={d}
                                    onChange={(e) => handleChangeOtp(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    required
                                />
                            ))}
                        </div>
                        <button 
                            className="btn w-100 fw-bold text-white py-2" 
                            style={{ backgroundColor: primaryBlue, borderRadius: "10px" }}
                        >
                            XÁC THỰC MÃ
                        </button>
                    </form>
                )}

                {/* STEP 3: NHẬP PASSWORD MỚI */}
                {step === 3 && (
                    <form onSubmit={resetPassword}>
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Mật khẩu mới <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                className="form-control border-0 border-bottom rounded-0 px-0 shadow-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                            <input
                                type="password"
                                className="form-control border-0 border-bottom rounded-0 px-0 shadow-none"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                        </div>
                        <button 
                            className="btn w-100 fw-bold text-white py-2" 
                            style={{ backgroundColor: "#28a745", borderRadius: "10px" }}
                            disabled={loading}
                        >
                            {loading ? "ĐANG CẬP NHẬT..." : "ĐẶT LẠI MẬT KHẨU"}
                        </button>
                    </form>
                )}

                <div className="text-center mt-4">
                    <span className="small text-muted">Quay lại trang </span>
                    <Link to="/login" className="small fw-bold text-decoration-none" style={{ color: primaryBlue }}>
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;