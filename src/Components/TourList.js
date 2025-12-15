import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Container, Row, Col, Card, Button,
  Spinner, Modal, Form, Alert, Pagination
} from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TourList = () => {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  
  // Mới: State lưu trữ số người đã đặt theo từng ngày của tour đang chọn
  const [availability, setAvailability] = useState({}); 

  const [searchFilter, setSearchFilter] = useState({
    budget: "",
    destination: "",
    tourType: "",
    startLocation: "", 
    travelDate: ""    
  });

  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 6;

  const [form, setForm] = useState({ numberOfPeople: 1, startDate: "", endDate: "" });
  const [errors, setErrors] = useState("");

  const API_URL = 'http://localhost:5000/api';
  const navigate = useNavigate();

const location = useLocation();
  useEffect(() => {
  const fetchTours = async () => {
    try {
      const res = await axios.get(`${API_URL}/tours`);
      const allTours = res.data.data.tours || [];
      
      // Đọc tham số từ URL
      const params = new URLSearchParams(location.search);
      const dest = params.get("destination");
      const date = params.get("travelDate");

      let filtered = allTours;

      // Nếu có địa điểm từ Home chuyển sang, tiến hành lọc ngay
      if (dest) {
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(dest.toLowerCase()) || 
          t.destination?.toLowerCase().includes(dest.toLowerCase())
        );
        // Đồng thời cập nhật UI filter bên trái
        setSearchFilter(prev => ({ ...prev, destination: dest }));
      }

      setTours(allTours);
      setFilteredTours(filtered);
    } catch (error) {
      console.error('Lỗi:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchTours();
}, [location.search]);

  const handleApplyFilter = () => {
    let result = [...tours];
    if (searchFilter.budget === "under5") result = result.filter(t => t.price < 5000000);
    else if (searchFilter.budget === "5-10") result = result.filter(t => t.price >= 5000000 && t.price <= 10000000);
    else if (searchFilter.budget === "above10") result = result.filter(t => t.price > 10000000);

    if (searchFilter.destination.trim() !== "") {
      const keyword = searchFilter.destination.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(keyword) || 
        t.destination?.toLowerCase().includes(keyword)
      );
    }

    if (searchFilter.startLocation.trim() !== "") {
      const loc = searchFilter.startLocation.toLowerCase();
      result = result.filter(t => t.startLocation?.toLowerCase().includes(loc));
    }

    if (searchFilter.travelDate) {
      const selectedDate = new Date(searchFilter.travelDate);
      result = result.filter(t => {
        if (!t.startDate || t.startDate.length === 0) return false;
        return t.startDate.some(dateStr => new Date(dateStr) >= selectedDate);
      });

      result.sort((a, b) => {
        const minA = Math.min(...a.startDate.map(d => new Date(d)).filter(d => d >= selectedDate));
        const minB = Math.min(...b.startDate.map(d => new Date(d)).filter(d => d >= selectedDate));
        return minA - minB;
      });
    }

    if (searchFilter.tourType !== "") {
      result = result.filter(t => t.tourType === searchFilter.tourType);
    }

    setFilteredTours(result);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
      setSearchFilter({ budget: "", destination: "", tourType: "", startLocation: "", travelDate: "" });
      setFilteredTours(tours);
  };

  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const calculateEndDate = (start, duration) => {
    if (!start || !duration) return "";
    const date = new Date(start);
    const days = parseInt(duration) || 1;
    date.setDate(date.getDate() + (days - 1));
    return date.toISOString().split("T")[0];
  };

  // MỚI: Hàm fetch số lượng chỗ đã đặt của Tour này
  const fetchAvailability = async (tourId) => {
    try {
        // Giả sử bạn có API trả về: { "2023-12-20": 40, "2023-12-25": 10 }
        // Nếu chưa có API này, bạn có thể chỉnh Backend trả về kèm trong Tour
        const res = await axios.get(`${API_URL}/bookings/availability/${tourId}`);
        setAvailability(res.data.data || {}); 
    } catch (error) {
        console.error("Không thể tải trạng thái chỗ trống");
    }
  };

  const openBookingForm = async (tour) => {
    setSelectedTour(tour);
    setErrors("");
    
    // Gọi API lấy chỗ trống (Nếu Backend của bạn đã tích hợp)
    // await fetchAvailability(tour._id); 

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
    if (!token) return alert("Vui lòng đăng nhập!");
    if (!form.numberOfPeople || !form.startDate) return setErrors("Vui lòng nhập đầy đủ thông tin.");
    
    try {
      await axios.post(`${API_URL}/bookings`, {
        tour: selectedTour._id,
        numberOfPeople: Number(form.numberOfPeople),
        startDate: form.startDate,
      }, { headers: { Authorization: `Bearer ${token}` } });

      alert("Đặt tour thành công!");
      setShowModal(false);
      navigate("/payment");
    } catch (error) {
      // Backend sẽ trả về lỗi nếu (currentBooked + numberOfPeople > maxGroupSize)
      setErrors(error.response?.data?.message || "Đặt tour thất bại");
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /><p>Đang tải dữ liệu...</p></div>;

  return (
    <Container className="my-5">
      <Row>
        <Col md={3} className="mb-4">
          <div className="p-3 border rounded shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0 text-uppercase" style={{ fontSize: '0.85rem' }}>Bộ lọc tìm kiếm</h6>
                <span className="text-primary small" style={{ cursor: 'pointer' }} onClick={handleResetFilter}>Xóa lọc</span>
            </div>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small">Ngân sách</Form.Label>
                <div className="d-flex flex-wrap gap-2 mt-1">
                  {[{ label: "Dưới 5tr", val: "under5" }, { label: "5 - 10tr", val: "5-10" }, { label: "Trên 10tr", val: "above10" }].map(item => (
                    <Button 
                      key={item.val}
                      variant={searchFilter.budget === item.val ? "primary" : "outline-secondary"}
                      size="sm" className="flex-grow-1"
                      onClick={() => setSearchFilter({ ...searchFilter, budget: item.val })}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small">Điểm khởi hành</Form.Label>
                <Form.Control type="text" placeholder="Ví dụ: TP.HCM..." size="sm" value={searchFilter.startLocation} onChange={(e) => setSearchFilter({ ...searchFilter, startLocation: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small">Bạn muốn đi đâu?</Form.Label>
                <Form.Control type="text" placeholder="Nhập địa danh..." size="sm" value={searchFilter.destination} onChange={(e) => setSearchFilter({ ...searchFilter, destination: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold small">Ngày đi dự kiến</Form.Label>
                <Form.Control type="date" size="sm" min={new Date().toISOString().split("T")[0]} value={searchFilter.travelDate} onChange={(e) => setSearchFilter({ ...searchFilter, travelDate: e.target.value })} />
              </Form.Group>
              <Button variant="primary" className="w-100 fw-bold py-2 shadow-sm" onClick={handleApplyFilter}>TÌM KIẾM NGAY</Button>
            </Form>
          </div>
        </Col>

        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0 fw-bold">Tour du lịch ưu đãi</h5>
            <div className="small text-muted">Tìm thấy <span className="text-primary fw-bold">{filteredTours.length}</span> tour phù hợp</div>
          </div>

          <Row>
            {currentTours.length === 0 ? (
              <Col className="text-center py-5">
                <i className="bi bi-emoji-frown fs-1 text-muted"></i>
                <h5 className="mt-3 text-muted">Không tìm thấy tour phù hợp.</h5>
              </Col>
            ) : (
              currentTours.map((tour) => (
                <Col md={12} key={tour._id} className="mb-4">
                  <Card className="shadow-sm border-0 overflow-hidden">
                    <Row className="g-0">
                      <Col md={4}>
                        <Card.Img src={tour.imageCover ? `http://localhost:5000/img/tours/${tour.imageCover}` : 'https://via.placeholder.com/400x250'} style={{ height: '100%', objectFit: 'cover', minHeight: '220px' }} />
                      </Col>
                      <Col md={8}>
                        <Card.Body className="p-4 d-flex flex-column justify-content-between h-100">
                          <div>
                            <div className="d-flex justify-content-between">
                                <Card.Title className="fw-bold fs-5 mb-2 text-primary">{tour.title}</Card.Title>
                                <span className="badge bg-light text-primary border h-50">{tour.tourType || 'Tiết kiệm'}</span>
                            </div>
                            <Row className="small text-secondary mt-3">
                              <Col xs={6} className="mb-2"><i className="bi bi-geo-alt me-2"></i>Điểm đến: {tour.destination}</Col>
                              <Col xs={6} className="mb-2"><i className="bi bi-clock me-2"></i>Thời gian: {tour.duration} Ngày</Col>
                              <Col xs={12} className="mb-2">
                                <i className="bi bi-calendar-event me-2"></i>
                                Ngày Khởi hành: {[...tour.startDate].sort((a, b) => new Date(a) - new Date(b)).slice(0, 3).map((d, i) => (
                                  <span key={i} className="badge bg-light text-primary border me-1 fw-normal">
                                    {new Date(d).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})}
                                  </span>
                                ))}
                                {tour.startDate.length > 3 && <span className="text-muted small">+{tour.startDate.length - 3} ngày</span>}
                              </Col>
                              <Col xs={6}><i className="bi bi-people me-2"></i>Nơi Khởi Hành: {tour.startLocation}</Col>
                              <Col xs={6}><i className="bi bi-people me-2"></i>Số Người Tối Đa: {tour.maxGroupSize}</Col>
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

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageChange(i + 1)}>{i + 1}</Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="fs-6">ĐẶT TOUR: {selectedTour?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {errors && <Alert variant="danger" className="py-2 small">{errors}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Số người tham gia</Form.Label>
              <Form.Control type="number" min="1" name="numberOfPeople" value={form.numberOfPeople} onChange={handleInputChange} />
              <Form.Text className="text-muted small">Tối đa: {selectedTour?.maxGroupSize} người</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Chọn ngày khởi hành</Form.Label>
              <Form.Select name="startDate" value={form.startDate} onChange={handleInputChange}>
                <option value="">-- Chọn ngày khởi hành --</option>
                {selectedTour?.startDate?.map((date, idx) => {
                    // Logic: Nếu số lượng đặt cho ngày này đã >= maxGroupSize thì disabled
                    const isFull = availability[date] >= selectedTour.maxGroupSize;
                    return (
                        <option key={idx} value={date} disabled={isFull}>
                            {new Date(date).toLocaleDateString('vi-VN')} {isFull ? "(Hết chỗ)" : ""}
                        </option>
                    );
                })}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-bold">Ngày kết thúc (Dự tính)</Form.Label>
              <Form.Control type="date" value={form.endDate} disabled className="bg-light" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setShowModal(false)}>Hủy bỏ</Button>
          <Button variant="primary" className="px-4" onClick={handleConfirmBooking}>Tiếp tục</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TourList;