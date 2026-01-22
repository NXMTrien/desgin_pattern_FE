import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, Loader2, Info, Eye, X, CreditCard, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap'; // Đảm bảo đã cài react-bootstrap

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State cho Modal chi tiết
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa xác định";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    // Hàm định dạng tiền tệ VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const response = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // LỌC: Chỉ lấy những đơn có trạng thái là 'paid' (hoặc 'Success' tùy DB của bạn)
                const paidData = response.data.data.bookings.filter(b => 
                    b.status === 'paid' || b.paymentStatus === 'paid'
                );
                
                setBookings(paidData);
            } catch (err) {
                setError("Không thể tải lịch sử đặt tour.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [navigate]);

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowModal(true);
    };

    if (loading) return (
        <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
            <Loader2 className="spinner-border text-primary mb-2" />
            <p>Đang tải dữ liệu thanh toán...</p>
        </div>
    );

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-dark">
                    <CreditCard className="me-2 text-success" />
                    Lịch sử Thanh toán
                </h2>
            </div>

            {bookings.length === 0 ? (
                <div className="text-center p-5 border rounded-4 bg-light">
                    <Info size={48} className="text-muted mb-3" />
                    <h4>Không có đơn hàng đã thanh toán</h4>
                    <p className="text-muted">Chỉ những tour đã thanh toán thành công mới hiển thị ở đây.</p>
                </div>
            ) : (
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="bg-success text-white">
                                <tr>
                                    <th className="py-3 ps-4">Tên Tour</th>
                                    <th className="py-3">Ngày đi</th>
                                    <th className="py-3 text-center">Số lượng</th>
                                    <th className="py-3 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking._id}>
                                        <td className="ps-4">
                                            <div className="fw-bold">{booking.tour?.title || "Tour tùy chỉnh"}</div>
                                            {/* <small className="text-success fw-medium">● Đã thanh toán</small> */}
                                        </td>
                                        <td>{formatDate(booking.startDate || booking.tour?.startDate)}</td>
                                        <td className="text-center">{booking.guests || booking.numberOfPeople} người</td>
                                        <td className="text-center">
                                            <button 
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                onClick={() => handleViewDetail(booking)}
                                            >
                                                <Eye size={14} className="me-1" /> Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL CHI TIẾT ĐƠN HÀNG */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="md">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Chi tiết đơn hàng</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-2">
                    {selectedBooking && (
                        <div className="p-2">
                            <div className="mb-4 text-center">
                                <div className="badge bg-success-subtle text-success p-2 px-3 rounded-pill mb-2">
                                    Đã Được Thanh Toán Thành Công
                                </div>
                                <h4 className="fw-bold text-primary">{selectedBooking.tour?.title || "Tour tùy chỉnh"}</h4>
                                <p className="text-muted small">Mã đơn: {selectedBooking._id}</p>
                            </div>

                            <div className="row g-3">
                                <div className="col-6">
                                    <label className="text-muted small fw-bold">NGÀY KHỞI HÀNH</label>
                                    <div className="d-flex align-items-center mt-1">
                                        <Calendar size={18} className="me-2 text-primary" />
                                        <span>{formatDate(selectedBooking.startDate || selectedBooking.tour?.startDate)}</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small fw-bold">NGÀY KHỞI HÀNH</label>
                                    <div className="d-flex align-items-center mt-1">
                                        <Calendar size={18} className="me-2 text-primary" />
                                        <span>{formatDate(selectedBooking.endDate || selectedBooking.tour?.endDate)}</span>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <label className="text-muted small fw-bold">SỐ LƯỢNG KHÁCH</label>
                                    <div className="d-flex align-items-center mt-1">
                                        <Users size={18} className="me-2 text-primary" />
                                        <span>{selectedBooking.guests || selectedBooking.numberOfPeople} người</span>
                                    </div>
                                </div>
                                <hr />
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                                        <div className="fw-bold d-flex align-items-center">
                                            <Tag size={18} className="me-2 text-success" /> TỔNG THANH TOÁN
                                        </div>
                                        <div className="fs-4 fw-bold text-danger">
                                            {formatPrice(selectedBooking.totalPrice || 0)}
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="col-12 mt-3">
                                    <label className="text-muted small fw-bold">GHI CHÚ / ĐỊA CHỈ</label>
                                    <p className="mt-1 small bg-light p-2 rounded">{selectedBooking.user?.address || "Không có ghi chú"}</p>
                                </div> */}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="secondary" className="w-100 rounded-pill" onClick={() => setShowModal(false)}>
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MyBookings;