import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Form, Alert, Card, Modal, Accordion, Spinner } from 'react-bootstrap';
import { MapPin, Clock, Users, BookOpen, Star, MessageSquare, Loader2 } from 'lucide-react';

// --- COMPONENT ĐÁNH GIÁ ---
const ReviewSection = ({ tourId }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `http://localhost:5000/api/tours/${tourId}/reviews`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews(res.data.data.reviews || []);
        } catch (err) {
            console.error("Lỗi lấy đánh giá:", err);
        }
    };

    useEffect(() => {
        if (tourId) fetchReviews();
    }, [tourId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return setError("❌ Bạn cần đăng nhập để đánh giá!");
        if (!comment.trim()) return setError("⚠️ Vui lòng nhập nội dung bình luận!");

        setLoading(true);
        setError("");
        try {
            await axios.post(
                `http://localhost:5000/api/tours/${tourId}/reviews`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setComment("");
            setRating(5);
            fetchReviews();
            alert("✅ Cảm ơn bạn đã đánh giá!");
        } catch (err) {
            setError(err.response?.data?.message || "❌ Gửi đánh giá thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-5 border-top pt-4">
            <h3 className="mb-4 d-flex align-items-center fw-bold text-dark">
                <MessageSquare className="me-2 text-primary" /> Đánh giá từ khách hàng ({reviews.length})
            </h3>

            <Card className="mb-5 shadow-sm border-0 bg-light">
                <Card.Body className="p-4">
                    <h5 className="fw-bold mb-3">Viết đánh giá của bạn</h5>
                    {error && <Alert variant="danger" className="py-2">{error}</Alert>}
                    <Form onSubmit={handleSubmitReview}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-block">Bạn chấm tour này mấy sao?</Form.Label>
                            <div className="d-flex gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <Star
                                        key={num}
                                        size={28}
                                        style={{ cursor: "pointer" }}
                                        fill={num <= rating ? "#ffc107" : "none"}
                                        color={num <= rating ? "#ffc107" : "#ccc"}
                                        onClick={() => setRating(num)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Chia sẻ cảm nhận của bạn về chuyến đi..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="border-0 shadow-sm"
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" disabled={loading} className="px-4 fw-bold">
                            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                            {loading ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>

            <div className="review-list">
                {reviews.length === 0 ? (
                    <Alert variant="info">Chưa có đánh giá nào. Hãy là người đầu tiên!</Alert>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev._id} className="mb-4 p-3 bg-white rounded shadow-sm border">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <div className="fw-bold text-primary" style={{ fontSize: '1.1rem' }}>
                                        {rev.user?.username || "Người dùng ẩn danh"}
                                    </div>
                                    <div className="d-flex my-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < rev.rating ? "#ffc107" : "none"}
                                                color={i < rev.rating ? "#ffc107" : "#ccc"}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <small className="text-muted italic">
                                    {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                                </small>
                            </div>
                            <p className="mt-2 mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                                {rev.comment}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- COMPONENT BLOG ---
const BlogContent = ({ blog }) => {
    if (!blog || !blog.description) return <Alert variant="warning">Chưa có nội dung Blog chi tiết cho Tour này.</Alert>;

    const renderDetailedTimeline = (text) => {
        if (!text) return null;
        const timeSegments = text.split(/(?=\(?(?:Sáng|Trưa|Chiều)\)?)/g).filter(s => s.trim() !== "");
        return timeSegments.map((segment, idx) => {
            const lines = segment.trim().split('\n');
            const header = lines[0]; 
            const content = lines.slice(1).join('\n');
            const isTimeHeader = /\(?(?:Sáng|Trưa|Chiều)\)?/.test(header);
            if (isTimeHeader) {
                return (
                    <div key={idx} className="mb-3">
                        <h2 className="fw-bold text-dark mt-3" style={{ fontSize: '1.2rem' }}>{header}</h2>
                        <div className="ps-4 text-secondary border-start" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {content || "Đang cập nhật nội dung..."}
                        </div>
                    </div>
                );
            }
            return <p key={idx} style={{ whiteSpace: 'pre-wrap' }} className="text-secondary">{segment}</p>;
        });
    };

    const renderFormattedAttractions = (text) => {
        if (!text) return null;
        const parts = text.split(/(?=Ngày \d+)/g).filter(p => p.trim() !== "");
        return (
            <Accordion defaultActiveKey="0" flush className="border rounded shadow-sm">
                {parts.map((part, index) => {
                    const lines = part.trim().split('\n');
                    const dayTitle = lines[0]; 
                    const dayDescription = lines.slice(1).join('\n'); 
                    return (
                        <Accordion.Item eventKey={index.toString()} key={index}>
                            <Accordion.Header>
                                <span className="fw-bold text-primary">{dayTitle}</span>
                            </Accordion.Header>
                            <Accordion.Body className="bg-white">
                                {renderDetailedTimeline(dayDescription)}
                            </Accordion.Body>
                        </Accordion.Item>
                    );
                })}
            </Accordion>
        );
    };

    return (
        <div className="mt-5 p-4 border rounded bg-white shadow-sm">
            <h3 className="text-primary fw-bold mb-4 d-flex align-items-center">
                <BookOpen className="me-2" /> {blog.title}
            </h3>
            <hr />
            <h5 className="mt-4 fw-bold text-dark bg-light p-2 rounded">📋 Chi tiết Tour</h5>
            <div className="p-3 mb-3 border rounded bg-light-subtle">
                <p style={{ whiteSpace: 'pre-wrap' }}>{blog.description.detail}</p>
            </div>
            <h5 className="mt-4 fw-bold text-primary bg-primary bg-opacity-10 p-2 rounded mb-3">Lịch trình tham quan chi tiết</h5>
            <div className="mb-4">{renderFormattedAttractions(blog.description.attractions)}</div>
            <h5 className="mt-4 fw-bold text-dark bg-light p-2 rounded"> Lưu ý cho chuyến đi</h5>
            <div className="p-3 border rounded bg-light-subtle">
                <p style={{ whiteSpace: 'pre-wrap' }}>{blog.description.meaningful_description}</p>
            </div>
        </div>
    );
};

// --- COMPONENT CHÍNH ---
const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [tour, setTour] = useState(null);
    const [blog, setBlog] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [form, setForm] = useState({ numberOfPeople: "", startDate: "", endDate: "" });
    const [errors, setErrors] = useState("");
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isBooking, setIsBooking] = useState(false); // TRẠNG THÁI LOADING

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/tours/${id}`);
                const data = res.data.data.tour;
                setTour(data);
                setMainImage(`http://localhost:5000/img/tours/${data.imageCover}`);
                fetchBlog(data._id);
            } catch (err) {
                setErrors("Không thể tải thông tin Tour.");
            }
        };
        fetchTour();
    }, [id]);

    const fetchBlog = async (tourId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/blogs/by-tour/${tourId}`);
            setBlog(res.data.data.blog);
        } catch (err) {
            setBlog(null);
        }
    };

    if (!tour) return <div className="p-4 text-center">Đang tải thông tin tour...</div>;

    const images = [tour.imageCover, ...(tour.images || [])];

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

    const handleConfirmBooking = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setShowLoginModal(true);
            return;
        }
        if (!form.numberOfPeople || !form.startDate) {
            return setErrors("⚠️ Vui lòng nhập đầy đủ Số người và Ngày khởi hành!");
        }

        setIsBooking(true); // BẮT ĐẦU LOADING
        setErrors("");

        try {
            const res = await axios.post(
                `http://localhost:5000/api/bookings`,
                {
                    tour: tour._id,
                    numberOfPeople: Number(form.numberOfPeople),
                    startDate: form.startDate,
                    bankCode: "",
                    language: "vn"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data?.data?.vnpUrl) {
                window.location.href = res.data.data.vnpUrl;
            } else {
                alert("✅ Đặt tour thành công!");
                navigate("/payment");
            }
        } catch (err) {
            setErrors(err.response?.data?.message || "❌ Đặt tour thất bại!");
            setIsBooking(false); // CHỈ TẮT LOADING KHI CÓ LỖI
        }
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4 text-center fw-bold text-primary">{tour.title}</h2>

            <div className="d-flex justify-content-center gap-4 mb-4 text-muted">
                <span className="d-flex align-items-center"><MapPin className="h-4 w-4 me-1" /> {tour.destination}</span>
                <span className="d-flex align-items-center"><Clock className="h-4 w-4 me-1" /> {tour.duration} ngày</span>
                <span className="d-flex align-items-center"><Users className="h-4 w-4 me-1" /> Tối đa: {tour.maxGroupSize}</span>
            </div>

            <div className="row">
                <div className="col-md-8">
                    <img
                        src={mainImage}
                        className="img-fluid rounded mb-3 shadow-sm"
                        style={{ width: "100%", height: "450px", objectFit: "cover" }}
                        alt="Main Cover"
                    />

                    <div className="d-flex gap-2 mb-4">
                        {images.slice(0, 5).map((img, index) => (
                            <img
                                key={index}
                                src={`http://localhost:5000/img/tours/${img}`}
                                className="rounded border shadow-sm"
                                style={{
                                    height: "80px", width: "80px", objectFit: "cover", cursor: "pointer",
                                    border: mainImage.endsWith(img) ? '3px solid #007bff' : '1px solid #ddd'
                                }}
                                onClick={() => setMainImage(`http://localhost:5000/img/tours/${img}`)}
                                alt="thumb"
                            />
                        ))}
                    </div>

                    <BlogContent blog={blog} />
                    <ReviewSection tourId={id} />
                </div>

                <div className="col-md-4">
                    <div className="p-4 border rounded shadow-lg bg-white sticky-top" style={{ top: '80px', zIndex: '10' }}>
                        <h4 className="text-center mb-3">Đặt Tour Ngay</h4>
                        <div className="text-center mb-4">
                            <span className="text-danger fw-bolder" style={{ fontSize: "28px" }}>
                                {tour.price?.toLocaleString()} đ
                            </span>
                            <span className="text-muted"> / người</span>
                        </div>

                        <Form.Group className="mb-3">
                            <Form.Label>Số người</Form.Label>
                            <Form.Control
                                type="number"
                                name="numberOfPeople"
                                value={form.numberOfPeople}
                                onChange={handleChange}
                                disabled={isBooking}
                                min="1"
                                max={tour.maxGroupSize}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold text-primary">Lịch khởi hành</Form.Label>
                            <Form.Select name="startDate" value={form.startDate} onChange={handleChange} disabled={isBooking}>
                                <option value="">-- Chọn ngày --</option>
                                {tour.startDate?.map((date, idx) => (
                                    <option key={idx} value={date}>
                                        {new Date(date).toLocaleDateString('vi-VN')}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Ngày kết thúc (tính tự động)</Form.Label>
                            <Form.Control type="date" value={form.endDate} disabled className="bg-light" />
                        </Form.Group>

                        {errors && <Alert variant="danger" className="mt-3 py-2 small">{errors}</Alert>}

                        <Button 
                            className="w-100 btn-lg fw-bold d-flex align-items-center justify-content-center" 
                            variant="primary" 
                            onClick={handleConfirmBooking}
                            disabled={isBooking}
                        >
                            {isBooking ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                "Xác Nhận Đặt Tour"
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal yêu cầu đăng nhập */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Modal.Body className="text-center p-5">
                    <div className="mb-4">
                        <Star size={60} className="text-warning mb-2" fill="#ffc107" />
                        <div style={{ fontSize: '50px', marginTop: '-40px' }}>🔑</div>
                    </div>
                    <h4 className="fw-bold text-dark">Yêu cầu đăng nhập</h4>
                    <p className="text-muted">Bạn cần đăng nhập tài khoản để thực hiện chức năng đặt tour.</p>
                    <div className="d-grid gap-2 mt-4">
                        <Button
                            variant="primary"
                            size="lg"
                            className="fw-bold"
                            onClick={() => navigate("/login", { state: { from: window.location.pathname } })}
                        >
                            Đăng nhập ngay
                        </Button>
                        <Button variant="link" className="text-secondary" onClick={() => setShowLoginModal(false)}>Để sau</Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default TourDetail;