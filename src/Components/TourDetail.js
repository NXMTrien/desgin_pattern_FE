import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Alert } from 'react-bootstrap';
import { MapPin, Clock, Users, DollarSign, BookOpen } from 'lucide-react';

// Hàm xử lý hiển thị nội dung Blog
const BlogContent = ({ blog }) => {
    if (!blog || !blog.description) return <Alert variant="warning">Chưa có nội dung Blog chi tiết cho Tour này.</Alert>;

    return (
        <div className="mt-5 p-4 border rounded bg-light">
            <h3 className="text-primary"><BookOpen className="inline-block mr-2" /> {blog.title}</h3>
            <hr />
            
            {/* Mô tả Chi tiết */}
            <h5 className="mt-4 text-secondary">Chi tiết Tour</h5>
            <div className="p-3 border rounded bg-white">
                <p style={{ whiteSpace: 'pre-wrap' }}>{blog.description.detail}</p>
            </div>
            
            {/* Điểm tham quan */}
            <h5 className="mt-4 text-secondary">Điểm tham quan nổi bật</h5>
            <div className="p-3 border rounded bg-white">
                <p style={{ whiteSpace: 'pre-wrap' }}>{blog.description.attractions}</p>
            </div>

            {/* Mô tả ý nghĩa */}
            <h5 className="mt-4 text-secondary">Sơ lược để chuyến đi thêm phần ý nghĩ hơn</h5>
            <div className="p-3 border rounded bg-white">
                <p style={{ whiteSpace: 'pre-wrap' }}>{blog.description.meaningful_description}</p>
            </div>
        </div>
    );
};


const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [blog, setBlog] = useState(null); // MỚI: State lưu trữ Blog
    const [mainImage, setMainImage] = useState(null);

    const [form, setForm] = useState({
        numberOfPeople: "",
        startDate: "",
        endDate: ""
    });

    const [errors, setErrors] = useState("");

    // Hàm lấy thông tin Tour
    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/tours/${id}`);
                const data = res.data.data.tour;

                setTour(data);
                setMainImage(`http://localhost:5000/img/tours/${data.imageCover}`);
                
                // Sau khi có tour, fetch blog liên quan
                fetchBlog(data._id); 

            } catch (err) {
                console.error("Lỗi khi fetch tour:", err);
                setErrors("Không thể tải thông tin Tour.");
            }
        };
        fetchTour();
    }, [id]);

    // Hàm lấy thông tin Blog
    const fetchBlog = async (tourId) => {
        try {
            // Giả định API Blogs cho phép tìm kiếm theo Id_Tour
            // Bạn cần đảm bảo Backend có route này. Ví dụ: /api/blogs/by-tour/:tourId
            const res = await axios.get(`http://localhost:5000/api/blogs/by-tour/${tourId}`); 
            setBlog(res.data.data.blog); 
        } catch (err) {
            // console.error("Lỗi khi fetch blog:", err.response?.data?.message || err.message);
            setBlog(null); 
        }
    };

    if (!tour) return <div className="p-4 text-center">Đang tải thông tin tour...</div>;

    const images = [tour.imageCover, ...(tour.images || [])];

    // Tự tính ngày kết thúc tour
    const calculateEndDate = (start, duration) => {
        if (!start || !duration) return "";
        const date = new Date(start);
        date.setDate(date.getDate() + (duration - 1));
        return date.toISOString().split("T")[0];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let updated = { ...form, [name]: value };

        if (name === "startDate") {
            updated.endDate = calculateEndDate(value, tour.duration);
        }
        setForm(updated);
    };

    // Gửi Booking API
    const handleConfirmBooking = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setErrors("❌ Bạn cần đăng nhập để đặt tour!");
            return;
        }

        if (!form.numberOfPeople || !form.startDate) {
            return setErrors("⚠️ Vui lòng nhập đầy đủ Số người và Ngày khởi hành!");
        }

        if (parseInt(form.numberOfPeople) > (tour.maxGroupSize || 100)) {
            return setErrors(`⚠️ Số người tối đa cho Tour này là ${tour.maxGroupSize}.`);
        }

        try {
            // setMessage("Đang tạo đơn đặt chỗ...");
            const res = await axios.post(
                `http://localhost:5000/api/bookings`,
                {
                    tour: tour._id,
                    numberOfPeople: Number(form.numberOfPeople),
                    startDate: form.startDate,
                    // Giả sử backend xử lý tính toán giá và user từ token
                    bankCode: "", // Thường dùng cho VNPay
                    language: "vn"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Kiểm tra và chuyển hướng dựa trên phản hồi của API
            if (res.data?.data?.vnpUrl) {
                // Nếu API trả về URL thanh toán (ví dụ: VNPay)
                window.location.href = res.data.data.vnpUrl;
            } else {
                // Hoặc chuyển hướng đến trang xác nhận/thanh toán nội bộ
                alert("✅ Đặt tour thành công! Chuyển đến trang thanh toán.");
                navigate("/payment");
            }

        } catch (err) {
            console.error("Lỗi đặt tour:", err.response || err);
            setErrors(err.response?.data?.message || "❌ Đặt tour thất bại! Vui lòng thử lại.");
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-center fw-bold text-primary">{tour.title}</h2>
            
            <div className="d-flex justify-content-center gap-4 mb-4 text-muted">
                <span className="d-flex align-items-center"><MapPin className="h-4 w-4 mr-1"/> {tour.destination}</span>
                <span className="d-flex align-items-center"><Clock className="h-4 w-4 mr-1"/> {tour.duration} ngày</span>
                <span className="d-flex align-items-center"><Users className="h-4 w-4 mr-1"/> Tối đa: {tour.maxGroupSize}</span>
            </div>

            <div className="row">

                {/* LEFT CONTENT: IMAGE + DESCRIPTION + BLOG */}
                <div className="col-md-8">
   <BlogContent blog={blog} />
                    {/* Ảnh chính */}
                    <img
                        src={mainImage}
                        className="img-fluid rounded mb-3 shadow-sm"
                        style={{ width: "100%", height: "450px", objectFit: "cover" }}
                        alt="Main Tour Cover"
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://via.placeholder.com/800x450?text=Image+Not+Found"; // Fallback image
                        }}
                    />

                    {/* Thumbnail dưới ảnh chính */}
                    <div className="d-flex gap-2 mb-4">
                        {images.slice(0, 5).map((img, index) => (
                            <img
                                key={index}
                                src={`http://localhost:5000/img/tours/${img}`}
                                className="rounded border shadow-sm"
                                style={{
                                    height: "80px",
                                    width: "80px",
                                    objectFit: "cover",
                                    cursor: "pointer",
                                    opacity: mainImage.endsWith(img) ? 1 : 0.7,
                                    border: mainImage.endsWith(img) ? '3px solid #007bff' : '1px solid #ddd'
                                }}
                                onClick={() => setMainImage(`http://localhost:5000/img/tours/${img}`)}
                                alt={`thumbnail ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* BLOG CONTENT */}
                 
                    
                    {/* Phần Mô tả Tour (description) đã được BỎ ĐI theo yêu cầu */}

                </div>

                {/* RIGHT CONTENT: BOOKING FORM */}
                <div className="col-md-4">
                    <div className="p-4 border rounded shadow-lg bg-white sticky-top" style={{ top: '20px' }}>

                        <h4 className="text-center mb-3">Đặt Tour Ngay</h4>
                        <div className="text-center mb-4">
                            <span className="text-danger fw-bolder" style={{ fontSize: "28px" }}>
                                {tour.price?.toLocaleString() || "Liên hệ"} đ
                            </span>
                            <span className="text-muted"> / người</span>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Số người</Form.Label>
                            <Form.Control
                                type="number"
                                name="numberOfPeople"
                                value={form.numberOfPeople}
                                placeholder={`Tối đa ${tour.maxGroupSize}`}
                                onChange={handleChange}
                                min="1"
                                max={tour.maxGroupSize}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
    <Form.Label className="fw-bold text-primary">Lịch khởi hành có sẵn</Form.Label>
    <Form.Select
        name="startDate"
        value={form.startDate}
        onChange={handleChange}
        className="border-primary"
    >
        <option value="">-- Chọn ngày khởi hành --</option>
        {/* Kiểm tra nếu tour có mảng startDate thì map ra các option */}
        {tour.startDate && tour.startDate.length > 0 ? (
            [...tour.startDate]
                .sort((a, b) => new Date(a) - new Date(b)) // Sắp xếp ngày gần nhất lên trước
                .map((date, idx) => {
                    const dateObj = new Date(date);
                    // Chỉ hiển thị các ngày chưa diễn ra
                    if (dateObj < new Date()) return null; 

                    return (
                        <option key={idx} value={date}>
                            {dateObj.toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            })}
                        </option>
                    );
                })
        ) : (
            <option disabled>Không có lịch khởi hành khả dụng</option>
        )}
    </Form.Select>
    <Form.Text className="text-muted">
        Vui lòng chọn một trong các ngày tour khởi hành phía trên.
    </Form.Text>
</Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Ngày kết thúc</Form.Label>
                            <Form.Control
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                disabled
                                className="bg-light"
                            />
                        </Form.Group>

                        {errors && (
                            <Alert variant="danger" className="mt-3">
                                {errors}
                            </Alert>
                        )}

                        <Button className="w-100 btn-lg" variant="success" onClick={handleConfirmBooking}>
                            <DollarSign className="h-5 w-5 inline-block mr-2"/> Xác Nhận Đặt Tour
                        </Button>
                        
                        <div className="text-center text-muted small mt-2">
                           Yêu cầu đăng nhập để thanh toán.
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default TourDetail;