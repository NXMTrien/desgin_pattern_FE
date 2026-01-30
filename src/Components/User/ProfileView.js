import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Edit, Phone, Home, Calendar, Loader2, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        dateOfBirth: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCurrentUser(response.data);
            setFormData({
                phone: response.data.phone || '',
                address: response.data.address || '',
                // Chuyển định dạng từ ISO string sang yyyy-MM-dd để input type="date" hiểu được
                dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : ''
            });
        } catch (err) {
            setError("Không thể tải thông tin tài khoản.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Gửi API cập nhật dữ liệu
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/auth/update-me`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            await fetchUserData();
            setIsEditing(false);
            alert("Cập nhật thành công!");
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        } finally {
            setUpdateLoading(false);
        }
    };

    // Hàm hiển thị ngày tháng tiếng Việt
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center"><Loader2 className="spinner-border text-primary" /></div>;

    return (
        <div className="container py-5" style={{ maxWidth: '600px' }}>
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="fs-4 fw-bold text-dark mb-0">
                            {isEditing ? "Chỉnh sửa hồ sơ" : "Thông tin Tài khoản"}
                        </h2>
                        {!isEditing && <button type="button" className="btn-close" onClick={() => navigate('/')}></button>}
                    </div>

                    <div className="text-center mb-4">
                        <div className="bg-success-subtle p-3 rounded-circle d-inline-flex">
                            <User size={48} className="text-success" />
                        </div>
                    </div>

                    {isEditing ? (
                        /* --- FORM CHỈNH SỬA --- */
                        <form onSubmit={handleUpdateProfile}>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">SỐ ĐIỆN THOẠI</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><Phone size={18} /></span>
                                    <input type="text" className="form-control bg-light border-0" value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold small text-muted">ĐỊA CHỈ</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><Home size={18} /></span>
                                    <input type="text" className="form-control bg-light border-0" value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})} />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-muted">NGÀY SINH</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-0"><Calendar size={18} /></span>
                                    <input type="date" className="form-control bg-light border-0" value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} />
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={updateLoading}>
                                    {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                                <button type="button" className="btn btn-light w-100 py-2 fw-bold" onClick={() => setIsEditing(false)}>Hủy</button>
                            </div>
                        </form>
                    ) : (
                        /* --- GIAO DIỆN XEM (ĐÃ THÊM NGÀY SINH) --- */
                        <div className="d-grid gap-3 text-start">
                            <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                <User size={20} className="me-3 text-primary" />
                                <div>
                                    <p className="small fw-bold text-muted mb-0">Tên Người Dùng</p>
                                    <p className="mb-0">{currentUser?.username}</p>
                                </div>
                            </div>
                           <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                <Mail size={20} className="me-3 text-primary" />
                                <div>
                                    <p className="small fw-bold text-muted mb-0">Gmail</p>
                                    <p className="mb-0">{currentUser?.email}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                <Phone size={20} className="me-3 text-primary" />
                                <div>
                                    <p className="small fw-bold text-muted mb-0">SỐ ĐIỆN THOẠI</p>
                                    <p className="mb-0">{currentUser?.phone || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                <Home size={20} className="me-3 text-primary" />
                                <div>
                                    <p className="small fw-bold text-muted mb-0">ĐỊA CHỈ</p>
                                    <p className="mb-0">{currentUser?.address || "Chưa cập nhật"}</p>
                                </div>
                            </div>
                            {/* ĐÂY LÀ PHẦN BỔ SUNG */}
                            <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                <Calendar size={20} className="me-3 text-primary" />
                                <div>
                                    <p className="small fw-bold text-muted mb-0">NGÀY SINH</p>
                                    <p className="mb-0">{formatDisplayDate(currentUser?.dateOfBirth)}</p>
                                </div>
                            </div>

                            <button onClick={() => setIsEditing(true)} className="btn btn-primary w-100 mt-2 py-2 fw-bold shadow-sm">
                                <Edit size={18} className="me-2" /> Chỉnh sửa trang cá nhân
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}