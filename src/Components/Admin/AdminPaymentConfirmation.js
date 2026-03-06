import React, { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import { io } from "socket.io-client"; // 1. Import Socket

const AdminPaymentConfirmation = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmingId, setConfirmingId] = useState(null); // Trạng thái đang xử lý cho từng nút
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_URL = process.env.REACT_APP_API_URL;

    const getAuthHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
    });

    const fetchAwaitingPayments = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/payments/admin/awaiting`, {
                headers: getAuthHeaders(),
            });
            setPayments(res.data.data.payments || []);
        } catch (err) {
            setError('Lỗi khi tải danh sách thanh toán.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchAwaitingPayments(); 
        
        // 2. Kết nối socket để lắng nghe nếu có khách báo chuyển khoản mới
        const socket = io(API_URL, {
            auth: { token: localStorage.getItem('token') }
        });
        
        socket.emit('join_admin_room'); // Admin vào room riêng

        socket.on("newNotification", (notif) => {
            // Nếu nhận được thông báo về thanh toán mới, load lại danh sách
            fetchAwaitingPayments();
        });

        return () => socket.disconnect();
    }, [API_URL]);

    const confirmPayment = async (paymentId) => {
        if (!window.confirm("Bạn đã chắc chắn nhận được tiền từ khách hàng này? Hệ thống sẽ gửi thông báo xác nhận cho khách ngay lập tức.")) return;
        
        setConfirmingId(paymentId); // Hiển thị spinner trên nút đang bấm
        setSuccess('');
        setError('');

        try {
            // 3. Gọi API xác nhận
            const res = await axios.post(`${API_URL}/api/payments/bank/confirm`, 
                { paymentId }, 
                { headers: getAuthHeaders() }
            );

            // 4. Hiển thị thông báo thành công
            setSuccess(`✅ Đã duyệt giao dịch #${paymentId.slice(-6)}. Hệ thống đã gửi thông báo đến khách hàng.`);
            
            // Tự động ẩn thông báo thành công sau 5 giây
            setTimeout(() => setSuccess(''), 5000);

            // Reload danh sách
            fetchAwaitingPayments(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Xác nhận thất bại.');
        } finally {
            setConfirmingId(null);
        }
    };

    if (loading) return (
        <Container className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Đang tìm các giao dịch chờ duyệt...</p>
        </Container>
    );

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="fw-bold mb-0">Xác Nhận Thanh Toán</h2>
                    <p className="text-muted">Duyệt các giao dịch chuyển khoản thủ công (Bank Transfer).</p>
                </div>
                <Button variant="outline-primary" size="sm" onClick={fetchAwaitingPayments}>
                    <i className="bi bi-arrow-clockwise"></i> Làm mới
                </Button>
            </div>
            
            <hr />

            {/* Thông báo kết quả */}
            {success && <Alert variant="success" className="shadow-sm" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
            {error && <Alert variant="danger" className="shadow-sm" dismissible onClose={() => setError('')}>{error}</Alert>}

            {payments.length === 0 ? (
                <div className="text-center py-5 bg-light rounded shadow-sm">
                    <i className="bi bi-check-circle text-success fs-1"></i>
                    <p className="mt-3 text-muted">Tuyệt vời! Hiện không còn giao dịch nào chờ xác nhận.</p>
                </div>
            ) : (
                <Table hover responsive className="shadow-sm align-middle bg-white">
                    <thead className="table-dark text-nowrap">
                        <tr>
                            <th>Mã GD</th>
                            <th>Khách hàng</th>
                            <th>Số tiền</th>
                            <th>Nội dung chuyển</th>
                            <th>Ngày báo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p._id}>
                                <td><Badge bg="secondary" className="font-monospace">#{p._id.slice(-6)}</Badge></td>
                                <td>
                                    <div className="fw-bold">{p.booking?.user?.name || 'Khách lẻ'}</div>
                                    <small className="text-muted">{p.booking?.user?.email}</small>
                                </td>
                                <td className="text-success fw-bold">
                                    {p.amount.toLocaleString('vi-VN')}₫
                                </td>
                                <td>
                                    <code className="bg-light p-1 border rounded text-primary">
                                        THANH TOAN BOOKING {p.booking?._id?.slice(-6)}
                                    </code>
                                </td>
                                <td>
                                    <small>{new Date(p.createdAt).toLocaleString('vi-VN')}</small>
                                </td>
                                <td>
                                    <Button 
                                        variant="success" 
                                        size="sm" 
                                        className="w-100"
                                        onClick={() => confirmPayment(p._id)}
                                        disabled={confirmingId === p._id}
                                    >
                                        {confirmingId === p._id ? (
                                            <><Spinner size="sm" animation="border" className="me-1"/> Đang duyệt...</>
                                        ) : (
                                            <><i className="bi bi-shield-check me-1"></i> Xác nhận khớp tiền</>
                                        )}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default AdminPaymentConfirmation;