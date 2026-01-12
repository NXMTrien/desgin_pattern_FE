import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

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
        <div className="forgot-wrapper">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
                
                .forgot-wrapper { font-family: 'Poppins', sans-serif; background-color: #f4f4f4; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
                .forgot-card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 450px; }
                .forgot-title { color: #005294; font-weight: 700; text-align: center; margin-bottom: 25px; font-size: 26px; }
                
                .form-group-custom { position: relative; margin-bottom: 25px; }
                .form-group-custom label { font-size: 14px; font-weight: 600; margin-bottom: 5px; display: block; }
                .form-group-custom label span { color: red; }
                
                .input-underline { border: none; border-bottom: 1.5px solid #ccc; border-radius: 0; padding: 10px 0; width: 100%; outline: none; transition: border-color 0.3s; background: transparent; }
                .input-underline:focus { border-bottom-color: #005294; }
                
                .field-icon { position: absolute; right: 0; bottom: 10px; color: #ccc; }

                /* NÚT BẤM ĐỒNG NHẤT: MẶC ĐỊNH XÁM - HOVER ĐỎ */
                .btn-action { 
                    background-color: #6c757d; 
                    color: white; 
                    font-weight: 700; 
                    padding: 12px; 
                    border-radius: 10px; 
                    border: none; 
                    margin-top: 10px; 
                    text-transform: uppercase; 
                    width: 100%;
                    transition: all 0.3s ease; 
                }
                .btn-action:hover { 
                    background-color: #e31b23; 
                    transform: translateY(-2px); 
                    box-shadow: 0 5px 15px rgba(227, 27, 35, 0.3);
                }
                .btn-action:disabled { background-color: #ccc; transform: none; box-shadow: none; }

                .otp-input { height: 50px; width: 50px; text-align: center; font-weight: bold; font-size: 20px; border: 1px solid #ddd; border-radius: 8px; transition: all 0.3s; }
                .otp-input:focus { border-color: #005294; box-shadow: 0 0 5px rgba(0,82,148,0.2); outline: none; }
            `}</style>

            <div className="forgot-card">
                <h2 className="forgot-title">
                    {step === 1 ? "Quên mật khẩu" : step === 2 ? "Xác thực mã OTP" : "Đặt lại mật khẩu"}
                </h2>

                {error && <div className="alert alert-danger py-2 small text-center">{error}</div>}
                {success && <div className="alert alert-success py-2 small text-center">{success}</div>}

                {/* BƯỚC 1: NHẬP EMAIL */}
                {step === 1 && (
                    <form onSubmit={sendOtp}>
                        <div className="form-group-custom">
                            <label>Email đăng ký <span>*</span></label>
                            <input
                                type="email"
                                className="input-underline"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="example@gmail.com"
                                required
                            />
                            <Mail size={18} className="field-icon" />
                        </div>
                        <button type="submit" className="btn-action" disabled={loading}>
                            {loading ? "ĐANG GỬI..." : "GỬI MÃ XÁC THỰC"}
                        </button>
                    </form>
                )}

                {/* BƯỚC 2: NHẬP OTP */}
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
                                    className="otp-input"
                                    value={d}
                                    onChange={(e) => handleChangeOtp(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    required
                                />
                            ))}
                        </div>
                        <button type="submit" className="btn-action">XÁC THỰC OTP</button>
                        <div className="text-center mt-3">
                            <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={() => setStep(1)}>
                                Thay đổi email?
                            </button>
                        </div>
                    </form>
                )}

                {/* BƯỚC 3: MẬT KHẨU MỚI */}
                {step === 3 && (
                    <form onSubmit={resetPassword}>
                        <div className="form-group-custom">
                            <label>Mật khẩu mới <span>*</span></label>
                            <input
                                type="password"
                                className="input-underline"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Tối thiểu 6 ký tự"
                                required
                            />
                            <Lock size={18} className="field-icon" />
                        </div>
                        <div className="form-group-custom">
                            <label>Xác nhận mật khẩu <span>*</span></label>
                            <input
                                type="password"
                                className="input-underline"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                            <ShieldCheck size={18} className="field-icon" />
                        </div>
                        <button type="submit" className="btn-action" disabled={loading}>
                            {loading ? "ĐANG CẬP NHẬT..." : "ĐẶT LẠI MẬT KHẨU"}
                        </button>
                    </form>
                )}

                <div className="text-center mt-4">
                    <Link to="/login" className="text-decoration-none small fw-bold text-muted d-flex align-items-center justify-content-center">
                        <ArrowLeft size={16} className="me-1" /> Quay lại Đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;