import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/VerifyEmailForm.css";

function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [step, setStep] = useState(1); // 1 = nhập email, 2 = nhập otp, 3 = đặt mật khẩu mới

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const inputRefs = useRef([]);

    // ======================================
    // XỬ LÝ NHẬP OTP
    // ======================================
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

    // ======================================
    // GỬI OTP QUA EMAIL
    // ======================================
    const sendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Vui lòng nhập email.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
                email,
            });

            setSuccess(res.data.message);
            setStep(2); // chuyển sang bước nhập OTP

        } catch (err) {
            setError(err.response?.data?.message || "Không thể gửi mã đặt lại mật khẩu.");
        } finally {
            setLoading(false);
        }
    };

    // ======================================
    // XÁC THỰC OTP (chỉ để chuyển bước)
    // ======================================
    const verifyOtp = (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const finalOtp = otp.join("");

        if (finalOtp.length !== 6) {
            setError("Vui lòng nhập đủ 6 chữ số OTP.");
            return;
        }

        setStep(3);
        setSuccess("Mã OTP hợp lệ! Vui lòng nhập mật khẩu mới.");
    };

    // ======================================
    // GỬI MẬT KHẨU MỚI
    // ======================================
    const resetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const finalOtp = otp.join("");

        if (!newPassword || !confirmPassword) {
            setError("Vui lòng nhập đầy đủ mật khẩu.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/auth/reset-password", {
                email,
                otp: finalOtp,
                newPassword,
            });

            setSuccess(res.data.message);
            setTimeout(() => navigate("/login"), 2000);

        } catch (err) {
            setError(err.response?.data?.message || "Đặt lại mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "480px" }}>
            <h2 className="text-center mb-4">Quên mật khẩu</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

           
            {step === 1 && (
                <form onSubmit={sendOtp}>
                    <div className="mb-3">
                        <label>Nhập email để đặt lại mật khẩu</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                            required
                        />
                    </div>

                    <button className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Đang gửi mã..." : "Gửi mã đặt lại"}
                    </button>
                </form>
            )}

            {/* =================== STEP 2: NHẬP OTP =================== */}
            {step === 2 && (
                <form onSubmit={verifyOtp}>
                    <p className="text-center">
                        Mã đặt lại mật khẩu đã được gửi đến email: <strong>{email}</strong>
                    </p>

                    <div className="otp-input-container">
                        {otp.map((d, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                className="form-control otp-input"
                                value={d}
                                onChange={(e) => handleChangeOtp(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                onFocus={(e) => e.target.select()}
                                required
                            />
                        ))}
                    </div>

                    <button className="btn btn-primary w-100 mt-3">
                        Xác thực mã
                    </button>
                </form>
            )}

            {/* =================== STEP 3: NHẬP PASSWORD MỚI =================== */}
            {step === 3 && (
                <form onSubmit={resetPassword}>
                    <div className="mb-3">
                        <label>Mật khẩu mới</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label>Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu"
                            required
                        />
                    </div>

                    <button className="btn btn-success w-100" disabled={loading}>
                        {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
                    </button>
                </form>
            )}
        </div>
    );
}

export default ForgotPassword;
