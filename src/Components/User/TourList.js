import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";
import {
    Container, Row, Col, Card, Button,
    Spinner, Modal, Form, Alert, Pagination
} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const VIETNAM_PROVINCES = [
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const TourList = () => {
    const [tours, setTours] = useState([]);
    const [filteredTours, setFilteredTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTour, setSelectedTour] = useState(null);
    const [showLoginAlert, setShowLoginAlert] = useState(false);

    const [searchFilter, setSearchFilter] = useState({
        budget: "",
        destination: "",
        tourType: "",
        startLocation: "",
        travelDate: "",
        rating: "" 
    });

    const [currentPage, setCurrentPage] = useState(1);
    const toursPerPage = 6;
    const [form, setForm] = useState({ numberOfPeople: 1, startDate: "", endDate: "" });
    const [errors, setErrors] = useState("");

    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchTours = async () => {
            try {
                // Thêm timestamp để tránh cache trình duyệt khi fetch
                const res = await axios.get(`${API_URL}/api/tours`);
                const allTours = res.data.data.tours || [];
                const params = new URLSearchParams(location.search);
                const dest = params.get("destination");

                let filtered = allTours;
                if (dest) {
                    filtered = filtered.filter(t =>
                        t.title?.toLowerCase().includes(dest.toLowerCase()) ||
                        t.destination?.toLowerCase().includes(dest.toLowerCase())
                    );
                    setSearchFilter(prev => ({ ...prev, destination: dest }));
                }

                setTours(allTours);
                setFilteredTours(filtered);
            } catch (error) {
                console.error('Lỗi khi tải tour:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, [location.search, API_URL]);

    const handleApplyFilter = () => {
        let result = [...tours];

        // 1. Lọc theo Ngân sách
        if (searchFilter.budget === "under5") result = result.filter(t => t.price < 5000000);
        else if (searchFilter.budget === "5-10") result = result.filter(t => t.price >= 5000000 && t.price <= 10000000);
        else if (searchFilter.budget === "10-20") result = result.filter(t => t.price > 10000000 && t.price <= 20000000);
        else if (searchFilter.budget === "above20") result = result.filter(t => t.price > 20000000);

        // 2. Lọc theo Đánh giá (Đồng bộ với số thập phân)
        if (searchFilter.rating !== "") {
            const selectedRating = Number(searchFilter.rating);
            result = result.filter(t => {
                const tourRating = t.averageRating || t.ratingsAverage || 0; 
                // Chọn 4 sao sẽ hiện tour từ 4.0 đến 4.9
                return Math.floor(tourRating) === selectedRating;
            });
        }

        // 3. Lọc theo Điểm đến
        if (searchFilter.destination !== "") {
            const keyword = searchFilter.destination.toLowerCase();
            result = result.filter(t =>
                t.title?.toLowerCase().includes(keyword) || 
                t.destination?.toLowerCase().includes(keyword)
            );
        }

        // 4. Lọc theo Điểm khởi hành
        if (searchFilter.startLocation !== "") {
            const loc = searchFilter.startLocation.toLowerCase();
            result = result.filter(t => t.startLocation?.toLowerCase().includes(loc));
        }

        // 5. Lọc theo ngày
        if (searchFilter.travelDate) {
            const selectedDate = new Date(searchFilter.travelDate);
            result = result.filter(t => {
                if (!t.startDate || t.startDate.length === 0) return false;
                return t.startDate.some(dateStr => new Date(dateStr) >= selectedDate);
            });
        }

        setFilteredTours(result);
        setCurrentPage(1);
    };

    const handleResetFilter = () => {
        setSearchFilter({ budget: "", destination: "", tourType: "", startLocation: "", travelDate: "", rating: "" });
        setFilteredTours(tours);
        setCurrentPage(1);
    };

    const calculateEndDate = (start, duration) => {
        if (!start || !duration) return "";
        const date = new Date(start);
        const days = parseInt(duration) || 1;
        date.setDate(date.getDate() + (days - 1));
        return date.toISOString().split("T")[0];
    };

    const openBookingForm = (tour) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setShowLoginAlert(true);
            return;
        }
        setSelectedTour(tour);
        setErrors("");
        const firstDate = tour.startDate?.[0] || "";
        setForm({
            numberOfPeople: 1,
            startDate: firstDate,
            endDate: firstDate ? calculateEndDate(firstDate, tour.duration) : ""
        });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let updatedForm = { ...form, [name]: value };
        if (name === "startDate" && selectedTour?.duration) {
            updatedForm.endDate = value ? calculateEndDate(value, selectedTour.duration) : "";
        }
        setForm(updatedForm);
    };

    const handleConfirmBooking = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(`${API_URL}/api/bookings`, {
                tour: selectedTour._id,
                numberOfPeople: Number(form.numberOfPeople),
                startDate: form.startDate,
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert("Đặt tour thành công!");
            setShowModal(false);
            navigate("/payment");
        } catch (error) {
            setErrors(error.response?.data?.message || "Đặt tour thất bại. Vui lòng thử lại.");
        }
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const indexOfLastTour = currentPage * toursPerPage;
    const indexOfFirstTour = indexOfLastTour - toursPerPage;
    const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
    const totalPages = Math.ceil(filteredTours.length / toursPerPage);

    if (loading) return (
        <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải danh sách tour...</p>
        </div>
    );

    return (
        <Container className="my-5">
            <Row>
                {/* SIDEBAR BỘ LỌC */}
                <Col md={3} className="mb-4">
                    <Card className="p-3 shadow-sm border-0 position-sticky" style={{ top: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.85rem' }}>Bộ lọc tìm kiếm</h6>
                            <span className="text-primary small fw-bold" style={{ cursor: 'pointer' }} onClick={handleResetFilter}>Xóa lọc</span>
                        </div>
                        <Form>
                            {/* Ngân sách */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small">Ngân sách</Form.Label>
                                <div className="d-flex flex-wrap gap-2 mt-1">
                                    {[
                                        { label: "Dưới 5tr", val: "under5" },
                                        { label: "5 - 10tr", val: "5-10" },
                                        { label: "10 - 20tr", val: "10-20" },
                                        { label: "Trên 20tr", val: "above20" }
                                    ].map(item => (
                                        <Button
                                            key={item.val}
                                            variant={searchFilter.budget === item.val ? "primary" : "outline-secondary"}
                                            size="sm" 
                                            style={{ width: '47%', fontSize: '0.75rem' }}
                                            onClick={() => setSearchFilter({ ...searchFilter, budget: item.val })}
                                        >
                                            {item.label}
                                        </Button>
                                    ))}
                                </div>
                            </Form.Group>

                            {/* Đánh giá */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small">Hạng đánh giá</Form.Label>
                                <div className="d-flex flex-wrap gap-2 mt-1">
                                    {["5", "4", "3", "2", "1"].map(star => (
                                        <Button
                                            key={star}
                                            variant={searchFilter.rating === star ? "warning" : "outline-secondary"}
                                            size="sm" 
                                            style={{ 
                                                width: star === "5" ? '100%' : '47%', 
                                                fontSize: '0.75rem', 
                                                fontWeight: '600'
                                            }}
                                            onClick={() => setSearchFilter({ ...searchFilter, rating: star })}
                                        >
                                            {star} <i className="bi bi-star-fill ms-1"></i>
                                        </Button>
                                    ))}
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small">Điểm khởi hành</Form.Label>
                                <Form.Select 
                                    size="sm" 
                                    value={searchFilter.startLocation} 
                                    onChange={(e) => setSearchFilter({ ...searchFilter, startLocation: e.target.value })}
                                >
                                    <option value="">Tất cả điểm đi</option>
                                    {VIETNAM_PROVINCES.map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold small">Điểm đến</Form.Label>
                                <Form.Select 
                                    size="sm" 
                                    value={searchFilter.destination} 
                                    onChange={(e) => setSearchFilter({ ...searchFilter, destination: e.target.value })}
                                >
                                    <option value="">Tất cả điểm đến</option>
                                    {VIETNAM_PROVINCES.map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-bold small">Ngày đi dự kiến</Form.Label>
                                <Form.Control 
                                    type="date" 
                                    size="sm" 
                                    value={searchFilter.travelDate} 
                                    onChange={(e) => setSearchFilter({ ...searchFilter, travelDate: e.target.value })} 
                                />
                            </Form.Group>

                            <Button 
                                variant="primary" 
                                className="w-100 fw-bold py-2 shadow-sm" 
                                style={{ backgroundColor: '#005294', border: 'none' }} 
                                onClick={handleApplyFilter}
                            >
                                TÌM KIẾM NGAY
                            </Button>
                        </Form>
                    </Card>
                </Col>

                {/* DANH SÁCH TOUR */}
                <Col md={9}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="mb-0 fw-bold">Kết quả tìm kiếm</h5>
                        <div className="small text-muted">Tìm thấy <span className="text-primary fw-bold">{filteredTours.length}</span> tour</div>
                    </div>

                    <Row>
                        {currentTours.length === 0 ? (
                            <Col className="text-center py-5">
                                <i className="bi bi-search fs-1 text-muted"></i>
                                <h5 className="mt-3 text-muted">Rất tiếc, không tìm thấy tour phù hợp!</h5>
                                <Button variant="link" onClick={handleResetFilter}>Xem tất cả tour</Button>
                            </Col>
                        ) : (
                            currentTours.map((tour) => (
                                <Col md={12} key={tour._id} className="mb-4">
                                    <Card className="shadow-sm border-0 overflow-hidden h-100">
                                        <Row className="g-0">
                                            <Col md={4}>
                                                <Card.Img 
                                                    src={tour.imageCover ? `${process.env.REACT_APP_API_URL}/img/tours/${tour.imageCover}` : 'https://via.placeholder.com/400x250'} 
                                                    style={{ height: '100%', objectFit: 'cover', minHeight: '220px' }} 
                                                />
                                            </Col>
                                            <Col md={8}>
                                                <Card.Body className="p-4 d-flex flex-column h-100">
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <Card.Title className="fw-bold fs-5 mb-2 text-primary">{tour.title}</Card.Title>
                                                            {/* HIỂN THỊ ĐÁNH GIÁ ĐỒNG NHẤT 3.5 */}
                                                            <div className="bg-warning px-2 py-1 rounded small fw-bold d-flex align-items-center">
                                                                <i className="bi bi-star-fill me-1" style={{fontSize: '0.8rem'}}></i>
                                                                {Number(tour.averageRating || tour.ratingsAverage || 0).toFixed(1)}
                                                            </div>
                                                        </div>
                                                        <Row className="small text-secondary mt-3">
                                                            <Col xs={6} className="mb-2"><i className="bi bi-geo-alt-fill text-danger me-2"></i>{tour.destination}</Col>
                                                            <Col xs={6} className="mb-2"><i className="bi bi-clock-history me-2 text-primary"></i>{tour.duration} Ngày</Col>
                                                            <Col xs={12} className="mb-2">
                                                                <i className="bi bi-calendar-check me-2 text-success"></i>
                                                                Khởi hành: {tour.startDate?.slice(0, 2).map((d, i) => (
                                                                    <span key={i} className="badge bg-light text-dark border me-1 fw-normal">
                                                                        {new Date(d).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                ))}
                                                                {tour.startDate?.length > 2 && <span className="small text-muted">...</span>}
                                                            </Col>
                                                            <Col xs={6}><i className="bi bi-map me-2"></i>Từ: {tour.startLocation || "Liên hệ"}</Col>
                                                            <Col xs={6}><i className="bi bi-people me-2"></i>Chỗ: {tour.maxGroupSize} người</Col>
                                                        </Row>
                                                    </div>
                                                    <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                                                        <div>
                                                            <div className="small text-muted">Giá từ:</div>
                                                            <div className="fs-4 fw-bold text-danger">{tour.price?.toLocaleString()} ₫</div>
                                                        </div>
                                                        <div className="d-flex gap-2">
                                                            <Button variant="outline-primary" size="sm" onClick={() => openBookingForm(tour)}>Đặt ngay</Button>
                                                            <Button variant="primary" size="sm" onClick={() => navigate(`/tour_detail/${tour._id}`)}>Chi tiết</Button>
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>

                    {/* PHÂN TRANG */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                                {[...Array(totalPages)].map((_, i) => (
                                    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageChange(i + 1)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </Col>
            </Row>

            {/* MODAL CẢNH BÁO ĐĂNG NHẬP */}
            <Modal show={showLoginAlert} onHide={() => setShowLoginAlert(false)} centered>
                <Modal.Body className="text-center p-5">
                    <i className="bi bi-shield-lock text-warning mb-3" style={{ fontSize: "4rem" }}></i>
                    <h4 className="fw-bold">Yêu cầu đăng nhập</h4>
                    <p className="text-muted">Bạn cần đăng nhập để đặt tour trực tuyến.</p>
                    <div className="d-grid gap-2 mt-4">
                        <Button variant="primary" onClick={() => navigate("/login")}>ĐĂNG NHẬP NGAY</Button>
                        <Button variant="link" className="text-muted" onClick={() => setShowLoginAlert(false)}>Hủy bỏ</Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* MODAL ĐẶT TOUR */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title className="fs-6 fw-bold">ĐẶT TOUR: {selectedTour?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {errors && <Alert variant="danger" className="py-2 small">{errors}</Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Số khách đi cùng</Form.Label>
                            <Form.Control type="number" min="1" max={selectedTour?.maxGroupSize} name="numberOfPeople" value={form.numberOfPeople} onChange={handleInputChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Ngày khởi hành dự kiến</Form.Label>
                            <Form.Select name="startDate" value={form.startDate} onChange={handleInputChange}>
                                <option value="">-- Chọn ngày --</option>
                                {selectedTour?.startDate?.map((date, idx) => (
                                    <option key={idx} value={date}>{new Date(date).toLocaleDateString('vi-VN')}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="p-3 bg-light rounded">
                            <span className="small fw-bold text-muted">Ngày kết thúc dự tính: </span>
                            <span className="fw-bold text-dark">{form.endDate ? new Date(form.endDate).toLocaleDateString('vi-VN') : '---'}</span>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Đóng</Button>
                    <Button variant="primary" style={{ backgroundColor: '#005294' }} onClick={handleConfirmBooking}>Xác nhận đặt tour</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default TourList;