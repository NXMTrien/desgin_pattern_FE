import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_URL = 'http://localhost:5000/api/blogs';

const AdminBlogPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const tourIdFromUrl = searchParams.get("tourId");

    const [formData, setFormData] = useState({
        Id_Tour: tourIdFromUrl || '',
        title: '',
        description: {
            detail: '',
            attractions: [], 
            meaningful_description: '',
        },
    });

    const [tourDuration, setTourDuration] = useState(0);
    const [tourTitle, setTourTitle] = useState(""); 
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTour, setIsLoadingTour] = useState(false);

    useEffect(() => {
        if (tourIdFromUrl) {
            fetchTourDetail(tourIdFromUrl);
        }
    }, [tourIdFromUrl]);

    const fetchTourDetail = async (id) => {
        setIsLoadingTour(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/tours/${id}`);
            const tourData = res.data.data.tour;
            
            setTourDuration(tourData.duration || 0);
            setTourTitle(tourData.title || ""); 
            
            setFormData(prev => ({
                ...prev,
                Id_Tour: id,
                description: {
                    ...prev.description,
                    attractions: Array(tourData.duration || 0).fill("") 
                }
            }));
        } catch (error) {
            setMessage("❌ Không tìm thấy thông tin tour để đồng bộ dữ liệu.");
        } finally {
            setIsLoadingTour(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (['detail', 'meaningful_description'].includes(name)) {
            setFormData(prev => ({
                ...prev,
                description: { ...prev.description, [name]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAttractionChange = (index, value) => {
        const newAttractions = [...formData.description.attractions];
        newAttractions[index] = value;
        setFormData(prev => ({
            ...prev,
            description: { ...prev.description, attractions: newAttractions }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
       const submissionData = {
        Id_Tour: formData.Id_Tour,
        title: formData.title,
        description: {
            detail: formData.description.detail || "",
           
            attractions: formData.description.attractions.join(" | "),
            meaningful_description: formData.description.meaningful_description || ""
        }
    };
        try {
            const token = localStorage.getItem("token");
            await axios.post(API_URL, submissionData, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setMessage("✅ Tạo nội dung Blog thành công!");
            setTimeout(() => navigate("/tours_admin"), 2000);
        } catch (error) {
            setMessage(`❌ Lỗi: ${error.response?.data?.message || "Không thể lưu blog"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingTour) return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Đang đồng bộ dữ liệu từ Tour...</p>
        </div>
    );

    return (
        <div className="container mt-5 mb-5 pb-5">
            <style>{`
                .form-section { background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #edf2f7; }
                .section-title { font-size: 0.9rem; border-left: 4px solid #0d6efd; padding-left: 12px; margin-bottom: 20px; color: #2d3748; text-transform: uppercase; letter-spacing: 0.5px; }
                .custom-btn { background-color: #f1f3f5; color: #495057; border: 1px solid #dee2e6; transition: all 0.2s ease; font-weight: 600; display: flex; align-items: center; justify-content: center; }
                .btn-save { background-color: #0d6efd; color: white; border-color: #0d6efd; }
                .btn-save:hover { background-color: #0b5ed7; transform: translateY(-2px); }
                .day-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
                .sticky-actions { position: sticky; bottom: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 15px; z-index: 1000; border: 1px solid #eee; border-radius: 15px; }
                .tour-info-badge { background: #e7f1ff; color: #0d6efd; padding: 5px 15px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }
                textarea.form-control { resize: none; line-height: 1.6; }
            `}</style>

            <header className="text-center mb-5">
                <h2 className="fw-bold text-uppercase">Nội Dung Chi Tiết Về Chuyến Đi</h2>
                <div className="mt-3 d-flex justify-content-center gap-2">
                    <span className="tour-info-badge">Tour: {tourTitle || "Chưa xác định"}</span>
                    <span className="tour-info-badge">Thời gian: {tourDuration} ngày</span>
                </div>
            </header>

            {message && (
                <div className={`alert fixed-top mx-auto mt-3 shadow-lg border-0 ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} style={{ width: 'fit-content', zIndex: 9999 }}>
                    <div className="px-3">{message}</div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">1. Thông tin cơ bản</h6>
                    <div className="row g-3">
                        <div className="col-md-12">
                            <label className="form-label fw-bold small text-muted">TIÊU ĐỀ BLOG</label>
                            <input type="text" name="title" className="form-control" placeholder="Tiêu đề bài viết..." value={formData.title} onChange={handleChange} required />
                        </div>
                    </div>
                </div>

                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">2. Lịch trình tham quan chi tiết</h6>
                    <div className="mb-4">
                        <label className="form-label fw-bold small text-muted">TỔNG QUAN CHUYẾN ĐI (DETAIL)</label>
                        <textarea name="detail" className="form-control" rows="4" value={formData.description.detail} onChange={handleChange} required placeholder="Giới thiệu chung về cảm hứng hành trình..."></textarea>
                    </div>

                    <label className="form-label fw-bold small text-muted mb-3">ĐIỂM ĐẾN THEO TỪNG NGÀY</label>
                    
                    {formData.description.attractions.map((text, index) => (
                        <div key={index} className="day-card">
                            <div className="mb-2 text-primary fw-bold">Ngày {index + 1}</div>
                            {/* Chuyển input thành textarea để có thể xuống dòng */}
                            <textarea 
                                className="form-control" 
                                rows="3"
                                placeholder={`Mô tả các địa điểm tham quan hoặc trải nghiệm của ngày ${index + 1}...`}
                                value={text}
                                onChange={(e) => handleAttractionChange(index, e.target.value)}
                                required
                            ></textarea>
                        </div>
                    ))}
                </div>

                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">3. Ghi chú ý nghĩa</h6>
                    <div className="col-12">
                        <label className="form-label fw-bold small text-muted">ĐỂ CHUYẾN ĐI Ý NGHĨA HƠN</label>
                        <textarea name="meaningful_description" className="form-control" rows="4" value={formData.description.meaningful_description} onChange={handleChange} required placeholder="Những lưu ý, tips chụp ảnh..."></textarea>
                    </div>
                </div>

                <div className="sticky-actions shadow-lg d-flex gap-3 justify-content-center">
                    <button type="button" className="custom-btn btn-lg px-4" onClick={() => navigate(-1)}>
                        QUAY LẠI
                    </button>
                    <button type="submit" className="custom-btn btn-lg px-5 btn-save" disabled={isSubmitting}>
                        {isSubmitting ? "ĐANG LƯU..." : "HOÀN TẤT LƯU BLOG"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminBlogPage;