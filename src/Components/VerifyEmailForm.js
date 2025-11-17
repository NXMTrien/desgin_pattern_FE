import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import '../css/VerifyEmailForm.css'; 

function VerifyEmailForm() {
    const navigate = useNavigate();
    const location = useLocation();
    
   
    const initialEmail = location.state?.email || ""; 

    const [email, setEmail] = useState(initialEmail);
   
    const [otp, setOtp] = useState(new Array(6).fill("")); 
    
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResendLoading, setIsResendLoading] = useState(false);

    // 🚨 TẠO ARRAY REF ĐỂ QUẢN LÝ 6 Ô INPUT
    const inputRefs = useRef([]); 
    
    useEffect(() => {
        if (!initialEmail) {
            setError("Vui lòng đăng ký trước để nhận mã xác thực.");
        }
    }, [initialEmail, navigate]);
    

    const handleChange = (element, index) => {
        // Chỉ chấp nhận 1 chữ số
        if (isNaN(element.value)) return;

        // 1. Cập nhật state OTP
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // 2. Tự động chuyển focus sang ô tiếp theo
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };
    
    const handleKeyDown = (e, index) => {
        // Xử lý phím BACKSPACE
        if (e.key === "Backspace" && index > 0 && otp[index] === "") {
            // Xóa giá trị của ô hiện tại trong state
            const newOtp = [...otp];
            newOtp[index - 1] = ""; 
            setOtp(newOtp);
            
            // Chuyển focus ngược về ô trước
            inputRefs.current[index - 1].focus();
        }
    };

    // =======================================================
    // HÀM GỬI FORM VÀ XỬ LÝ GỬI LẠI
    // =======================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const finalOtp = otp.join(""); // 🚨 Nối mảng state thành chuỗi OTP
        if (finalOtp.length !== 6) {
            setError("Vui lòng nhập đủ 6 chữ số OTP.");
            return;
        }

        if (!email) {
            setError("Không tìm thấy Email để xác thực.");
            return;
        }
        setIsLoading(true);

        try {
            const res = await axios.post("http://localhost:5000/api/auth/verify-email", {
                email, 
                otp: finalOtp, // Gửi chuỗi OTP đã nối
            });

            if (res.status === 200) {
                setSuccess(res.data.message || "Xác thực thành công! Đang chuyển hướng...");
                setTimeout(() => navigate("/login"), 2000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        // ... (Logic resend giữ nguyên, chỉ đảm bảo gửi kèm email) ...
        if (!email) {
            setError("Không tìm thấy Email để gửi lại mã.");
            return;
        }
        setIsResendLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await axios.post("http://localhost:5000/api/auth/resend-email", {
                email, 
            });

            setSuccess(res.data.message || "Đã gửi lại mã xác thực mới. Vui lòng kiểm tra email.");

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Không thể gửi lại mã. Vui lòng thử lại sau.";
            setError(errorMessage);
        } finally {
            setIsResendLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "450px" }}>
            <h2 className="text-center mb-4">Xác thực Email</h2>
            <p className="text-center text-muted">Mã OTP đã được gửi tới email: 
                <strong>{email ? email : '...'}</strong>
            </p>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        readOnly={!!initialEmail} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        required
                    />
                </div>
                
                <div className="mb-3">
                    <label>Mã OTP (6 chữ số)</label>
                    {/* 🚨 KHU VỰC NHẬP OTP MỚI 🚨 */}
                    <div className="otp-input-container">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                name="otp"
                                maxLength="1" // Giới hạn chỉ 1 ký tự
                                className="form-control otp-input"
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                onFocus={e => e.target.select()} // Tự động chọn ký tự khi focus
                                required
                                // Gán ref cho từng ô input
                                ref={el => inputRefs.current[index] = el}
                            />
                        ))}
                    </div>
                    {/* 🚨 KẾT THÚC KHU VỰC NHẬP OTP MỚI 🚨 */}
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-2" disabled={isLoading || !email}>
                    {isLoading ? "Đang xác thực..." : "Xác thực"}
                </button>
            </form>
            
            <div className="text-center">
                <button 
                    type="button" 
                    className="btn btn-link" 
                    onClick={handleResend} 
                    disabled={isResendLoading || !email} 
                >
                    {isResendLoading ? "Đang gửi lại..." : "Gửi lại mã xác thực"}
                </button>
            </div>
        </div>
    );
}

export default VerifyEmailForm;