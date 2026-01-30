// src/components/AdminPaymentConfirmation.js

import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import axios from 'axios';

const AdminPaymentConfirmation = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmationMessage, setConfirmationMessage] = useState('');

    const API_URL = `${process.env.REACT_APP_API_URL}/api`;

    // Giả định hàm lấy headers (cần có role Admin)
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // 1. Lấy danh sách các giao dịch chờ xác nhận
    const fetchAwaitingPayments = async () => {
        setLoading(true);
        setError('');
        try {
            // 🚨 Giả định có API dành cho Admin để lọc các Payment đang chờ xác nhận
            const res = await axios.get(`${API_URL}/payments/admin/awaiting`, {
                headers: getAuthHeaders(),
            });
            setPayments(res.data.data.payments); // Giả định response trả về mảng payments
        } catch (err) {
            console.error("Error fetching payments:", err);
            setError('Lỗi khi tải danh sách thanh toán chờ xác nhận.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAwaitingPayments();
    }, []);

    // 2. Xác nhận thanh toán (Admin Action)
    const confirmPayment = async (paymentId) => {
        setConfirmationMessage('');
        try {
            // Gọi API xác nhận Admin (đã được bảo vệ bằng restrictTo('admin') ở Backend)
            const res = await axios.post(
                `${API_URL}/payments/bank/confirm`,
                { paymentId },
                { headers: getAuthHeaders() }
            );

            setConfirmationMessage(`✅ Xác nhận Payment ID: ${paymentId.slice(-6)} thành công!`);
            
            // Tải lại danh sách sau khi xác nhận
            fetchAwaitingPayments(); 

        } catch (err) {
            console.error("Error confirming payment:", err);
            const errMsg = err.response?.data?.message || 'Xác nhận thanh toán thất bại.';
            setError(`❌ Lỗi xác nhận: ${errMsg}`);
        }
    };

    if (loading) {
        return <Container className="text-center my-5"><Spinner animation="border" /> Đang tải danh sách...</Container>;
    }
    
    // Kiểm tra xem có payment nào đang chờ hay không
    const awaitingPayments = payments.filter(p => p.status === 'awaiting_confirmation' && p.method === 'transfer');

    return (
        <Container className="my-5">
            <h2> Xác Nhận Thanh Toán Chuyển Khoản </h2>
            <p className="text-muted">Quản lý các giao dịch mà khách hàng đã thông báo chuyển khoản.</p>
            
            <hr />

            {confirmationMessage && <Alert variant="success">{confirmationMessage}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            {awaitingPayments.length === 0 ? (
                <Alert variant="info" className="text-center">
                    Không có giao dịch chuyển khoản nào đang chờ xác nhận.
                </Alert>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>ID Payment</th>
                            <th>Booking ID</th>
                            <th>Số tiền</th>
                            <th>Nội dung CK</th>
                            <th>Thời gian báo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {awaitingPayments.map((payment) => (
                            <tr key={payment._id}>
                                <td>{payment._id.slice(-8)}</td>
                                <td>{payment.booking?.slice(-8)}</td> 
                                <td><strong className='text-success'>{payment.amount.toLocaleString()} VNĐ</strong></td>
                                {/* Giả định bạn có thể lưu nội dung chuyển khoản trong paymentDetails (tùy thuộc vào backend) */}
                                <td>THANH TOAN BOOKING {payment.booking?.slice(-6)}</td> 
                                <td>
                {new Date(payment.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </td>
                                <td>
                                    <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={() => confirmPayment(payment._id)}
                                        disabled={loading} // Sử dụng trạng thái loading riêng nếu cần chi tiết hơn
                                    >
                                        Xác nhận Đã Nhận Tiền
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            
            <Button onClick={fetchAwaitingPayments} variant="outline-secondary" className="mt-3">
                <i className="fas fa-sync-alt"></i> Tải lại danh sách
            </Button>
        </Container>
    );
};

export default AdminPaymentConfirmation;