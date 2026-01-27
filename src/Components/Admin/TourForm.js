import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
    Upload, Image, Loader2, MapPin, Edit3, 
    Trash2, XCircle, PlusCircle, Navigation, CheckCircle2, AlertTriangle
} from 'lucide-react';

const VIETNAM_PROVINCES = [
    "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng",
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
    "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
    "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
    "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Quảng Bình",
    "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
    "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
    "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long",
    "Vĩnh Phúc", "Yên Bái", "Phú Yên"
].sort();

const TourForm = () => {
    const navigate = useNavigate();
    const [editingTourId, setEditingTourId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [showConfirm, setShowConfirm] = useState({ show: false, tour: null }); // State cho Modal xác nhận xóa
    
    const [formData, setFormData] = useState({
        title: "", destination: "", duration: 1, category: "", price: "",
        maxGroupSize: "", description: "", startLocation: "TP. Hồ Chí Minh",
        startDates: [], currentDateInput: ""
    });

    const [imageCover, setImageCover] = useState(null);
    const [otherImages, setOtherImages] = useState([]);
    const [previews, setPreviews] = useState({ cover: null, others: [] });
    const [message, setMessage] = useState("");
    const [tours, setTours] = useState([]);
    const [categories, setCategories] = useState([]);
    const [role, setRole] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const storedUserString = localStorage.getItem("user");
        let userRole = "guest";
        if (storedUserString) {
            try {
                const storedUser = JSON.parse(storedUserString);
                if (storedUser?.role) userRole = storedUser.role;
            } catch (e) { console.error(e); }
        }
        setRole(userRole);
        fetchCategories();
        fetchTours();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/categories", { headers: getAuthHeaders() });
            setCategories(res.data.data.categories || []);
        } catch (error) { console.error("Lỗi fetch categories:", error); }
    };

    const fetchTours = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/tours");
            setTours(res.data.data.tours || []);
        } catch (error) { console.error("Lỗi fetch tours:", error); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'imageCover') {
            const file = files[0];
            if (file) {
                setImageCover(file);
                setPreviews(p => ({ ...p, cover: URL.createObjectURL(file) }));
            }
        } else if (name === 'images') {
            const selectedFiles = Array.from(files).slice(0, 5);
            setOtherImages(selectedFiles);
            setPreviews(p => ({ ...p, others: selectedFiles.map(f => URL.createObjectURL(f)) }));
        }
    };

    const addDate = () => {
        if (!formData.currentDateInput) return;
        if (formData.startDates.includes(formData.currentDateInput)) {
            setMessage("❌ Ngày này đã có trong danh sách!");
            setTimeout(() => setMessage(""), 3000);
            return;
        }
        setFormData(prev => ({
            ...prev,
            startDates: [...prev.startDates, prev.currentDateInput].sort(),
            currentDateInput: ""
        }));
    };

    const removeDate = (dateToRemove) => {
        setFormData(prev => ({ 
            ...prev, 
            startDates: prev.startDates.filter(d => d !== dateToRemove) 
        }));
    };

    const resetForm = () => {
        setEditingTourId(null);
        setFormData({
            title: "", destination: "", duration: 1, category: "", price: "",
            maxGroupSize: "", description: "", startLocation: "TP. Hồ Chí Minh", 
            startDates: [], currentDateInput: ""
        });
        setImageCover(null);
        setOtherImages([]);
        setPreviews({ cover: null, others: [] });
    };

    const handleEdit = (tour) => {
        setEditingTourId(tour._id);
        setFormData({
            title: tour.title || "",
            destination: tour.destination || "",
            duration: tour.duration || 1,
            category: tour.category?._id || tour.category || "",
            price: tour.price || "",
            maxGroupSize: tour.maxGroupSize || "",
            description: tour.description || "",
            startLocation: tour.startLocation || "TP. Hồ Chí Minh",
            startDates: Array.isArray(tour.startDate) 
                ? tour.startDate.map(date => new Date(date).toISOString().split('T')[0]) 
                : [],
            currentDateInput: ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Hàm mở Modal xác nhận xóa
    const confirmDelete = (tour) => {
        setShowConfirm({ show: true, tour });
    };

    // Hàm thực hiện xóa thực sự gọi tới Backend
   const handleDelete = async () => {
    const tour = showConfirm.tour;
    if (!tour) return;

    setDeletingId(tour._id);
    setShowConfirm({ show: false, tour: null });

    try {
        // Gửi request xóa
        await axios.delete(`http://localhost:5000/api/tours/${tour._id}`, { 
            headers: getAuthHeaders() 
        });

       
        setTours(prevTours => prevTours.filter(item => item._id !== tour._id));
        
        setMessage(`✅ Xóa tour thành công!`);
    } catch (err) {
        // 🛑 XỬ LÝ LỖI 404 (Trường hợp của bạn)
        if (err.response && err.response.status === 404) {
            // Nếu 404 nghĩa là server không thấy tour này -> cũng xóa luôn ở UI cho khớp
            setTours(prevTours => prevTours.filter(item => item._id !== tour._id));
            setMessage("ℹ️ Tour không tồn tại hoặc đã được xóa trước đó.");
        } else {
            setMessage(`❌ Lỗi: ${err.response?.data?.message || "Không thể xóa tour"}`);
        }
    } finally {
        setDeletingId(null);
        setTimeout(() => setMessage(""), 3000);
    }
};

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const tourFormData = new FormData();
        tourFormData.append('title', formData.title);
        tourFormData.append('destination', formData.destination);
        tourFormData.append('duration', formData.duration);
        tourFormData.append('category', formData.category);
        tourFormData.append('price', formData.price);
        tourFormData.append('maxGroupSize', formData.maxGroupSize);
        tourFormData.append('description', formData.description);
        tourFormData.append('startLocation', formData.startLocation);
        
        if (formData.startDates.length === 0) {
            tourFormData.append('startDate', ''); 
        } else {
            formData.startDates.forEach(date => tourFormData.append('startDate', date));
        }

        if (imageCover) tourFormData.append('imageCover', imageCover);
        otherImages.forEach(file => tourFormData.append('images', file));

        const url = editingTourId ? `http://localhost:5000/api/tours/${editingTourId}` : `http://localhost:5000/api/tours`;
        const method = editingTourId ? 'patch' : 'post';

        const response = await axios[method](url, tourFormData, {
            headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
        });

        const newTourId = response.data.data.tour?._id;

        if (editingTourId) {
            setMessage("✅ Cập nhật tour thành công!");
            resetForm();
            fetchTours();
        } else {
            // CẬP NHẬT TẠI ĐÂY: Thông báo và chuyển hướng sang /admin_blog
            setMessage("✅ Tạo tour thành công! Đang chuyển hướng sang trang Blog...");
            setTimeout(() => {
                navigate(`/admin_blog?tourId=${newTourId}`);
            }, 1500);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        setMessage(`❌ Lỗi: ${err.response?.data?.message || "Thao tác thất bại"}`);
    } finally {
        setIsSubmitting(false);
        if (editingTourId) setTimeout(() => setMessage(""), 5000);
    }
};

    if (role !== "admin") return <div className="container mt-5 alert alert-danger text-center shadow-sm">❌ Quyền admin yêu cầu để truy cập trang này.</div>;

    return (
        <div className="container mt-5 mb-5 pb-5">
            <style>{`
                .custom-btn { background-color: #f1f3f5; color: #495057; border: 1px solid #dee2e6; transition: all 0.2s ease; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .btn-save:hover { background-color: #0d6efd; color: white; border-color: #0d6efd; }
                .btn-update:hover { background-color: #ffc107; color: black; border-color: #ffc107; }
                .btn-cancel:hover { background-color: #adb5bd; color: white; border-color: #adb5bd; }
                .btn-edit:hover { background-color: #e7f1ff; color: #0d6efd; border-color: #0d6efd; }
                .btn-delete:hover { background-color: #fff5f5; color: #dc3545; border-color: #dc3545; }
                .form-section { background: white; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #edf2f7; }
                .section-title { font-size: 0.9rem; border-left: 4px solid #0d6efd; padding-left: 12px; margin-bottom: 20px; color: #2d3748; text-transform: uppercase; letter-spacing: 0.5px; }
                .preview-img { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #eee; }
                .sticky-actions { position: sticky; bottom: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 15px; z-index: 1000; border: 1px solid #eee; border-radius: 15px; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(4px); }
            `}</style>

            {/* MODAL XÁC NHẬN XÓA (THAY CHO ALERT) */}
            {showConfirm.show && (
                <div className="modal-overlay">
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center" style={{ maxWidth: '400px', border: '1px solid #eee' }}>
                        <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex p-3 mb-3">
                            <AlertTriangle size={32} />
                        </div>
                        <h5 className="fw-bold mb-2">Xác nhận xóa?</h5>
                        <p className="text-muted small mb-4">
                            Bạn có chắc chắn muốn xóa tour <b className="text-dark">{showConfirm.tour?.title}</b>? 
                            Hành động này không thể hoàn tác và sẽ xóa dữ liệu khỏi hệ thống.
                        </p>
                        <div className="d-flex gap-2 justify-content-center">
                            <button className="btn btn-light px-4 fw-600" onClick={() => setShowConfirm({ show: false, tour: null })}>Hủy bỏ</button>
                            <button className="btn btn-danger px-4 fw-600" onClick={handleDelete}>Đồng ý xóa</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="text-center mb-5">
                <h2 className="fw-bold text-uppercase">{editingTourId ? "🔄 Chỉnh sửa Tour" : "➕ Thêm Mới Tour"}</h2>
                <p className="text-muted">Thông tin Blog sẽ được tạo ở bước tiếp theo</p>
            </header>

            {message && (
                <div className={`alert fixed-top mx-auto mt-3 shadow-lg border-0 ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} style={{ width: 'fit-content', zIndex: 9999 }}>
                    <div className="d-flex align-items-center gap-2 px-3">
                        {message.startsWith('✅') ? <CheckCircle2 size={18}/> : <XCircle size={18}/>}
                        {message}
                        <XCircle size={18} className="cursor-pointer ms-3" onClick={() => setMessage("")} />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">1. Thông tin chung</h6>
                    <div className="row g-3">
                        <div className="col-md-8">
                            <label className="form-label fw-bold small text-muted">TIÊU ĐỀ TOUR</label>
                            <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">DANH MỤC</label>
                            <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                                <option value="">-- Chọn --</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">ĐIỂM ĐẾN</label>
                            <div className="input-group">
                                <span className="input-group-text"><MapPin size={16}/></span>
                                <input type="text" name="destination" className="form-control" value={formData.destination} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">NƠI KHỞI HÀNH</label>
                            <div className="input-group">
                                <span className="input-group-text"><Navigation size={16}/></span>
                                <select name="startLocation" className="form-select" value={formData.startLocation} onChange={handleChange} required>
                                    {VIETNAM_PROVINCES.map(province => (
                                        <option key={province} value={province}>{province}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted text-primary">LỊCH KHỞI HÀNH</label>
                            <div className="input-group">
                                <input type="date" className="form-control" value={formData.currentDateInput} onChange={(e) => setFormData({...formData, currentDateInput: e.target.value})} />
                                <button type="button" className="btn btn-primary" onClick={addDate}><PlusCircle size={18}/></button>
                            </div>
                        </div>
                        <div className="col-12 d-flex flex-wrap gap-2 mt-2">
                            {formData.startDates.map(date => (
                                <span key={date} className="badge bg-primary-subtle text-primary border p-2 d-flex align-items-center gap-2">
                                    {new Date(date).toLocaleDateString('vi-VN')}
                                    <XCircle size={14} className="cursor-pointer" onClick={() => removeDate(date)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">2. Giá & Chi tiết</h6>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">THỜI LƯỢNG (NGÀY)</label>
                            <input type="number" name="duration" className="form-control border-primary fw-bold" value={formData.duration} onChange={handleChange} required min="1" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">GIÁ TOUR (VNĐ)</label>
                            <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold small text-muted">KHÁCH TỐI ĐA</label>
                            <input type="number" name="maxGroupSize" className="form-control" value={formData.maxGroupSize} onChange={handleChange} required />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold small text-muted">MÔ TẢ TÓM TẮT TOUR</label>
                            <textarea name="description" className="form-control" rows="3" value={formData.description} onChange={handleChange} required placeholder="Mô tả ngắn hiển thị tại danh sách tour..."></textarea>
                        </div>
                    </div>
                </div>

                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">3. Hình ảnh quảng bá</h6>
                    <div className="row g-4">
                        <div className="col-md-6 border-end">
                            <label className="form-label fw-bold small">ẢNH BÌA CHÍNH (COVER)</label>
                            <input type="file" name="imageCover" className="form-control mb-2" onChange={handleFileChange} accept="image/*" />
                            {previews.cover && <img src={previews.cover} alt="Cover" className="preview-img w-100 h-auto" style={{maxHeight:'180px'}} />}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">ALBUM ẢNH PHỤ</label>
                            <input type="file" name="images" className="form-control mb-2" onChange={handleFileChange} multiple accept="image/*" />
                            <div className="d-flex flex-wrap gap-2">{previews.others.map((s,i) => <img key={i} src={s} alt="Preview" className="preview-img" />)}</div>
                        </div>
                    </div>
                </div>

                <div className="sticky-actions shadow-lg d-flex gap-3 justify-content-center">
                    <button type="submit" className={`custom-btn btn-lg px-5 ${editingTourId ? 'btn-update' : 'btn-save'}`} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (editingTourId ? "LƯU THAY ĐỔI" : "TIẾP TỤC: TẠO BLOG")}
                    </button>
                    {editingTourId && <button type="button" className="custom-btn btn-lg px-4 btn-cancel" onClick={resetForm}>HỦY BỎ</button>}
                </div>
            </form>

            <div className="mt-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">📋 Quản lý Tour</h4>
                    <span className="badge bg-dark">{tours.length} Tours</span>
                </div>
                <div className="table-responsive shadow-sm border rounded-3 bg-white">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">STT</th>
                                <th>Thông tin Tour</th>
                                <th>Điểm đến</th>
                                <th>Giá</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tours.map((tour, index) => (
                                <tr key={tour._id} className={editingTourId === tour._id ? "table-warning" : ""}>
                                    <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                    <td>
                                        <div className="fw-bold">{tour.title}</div>
                                        <div className="small text-muted">{tour.duration} Ngày | {tour.category?.name || "N/A"}</div>
                                    </td>
                                    <td><div className="small"><MapPin size={12} className="text-danger me-1"/>{tour.destination}</div></td>
                                    <td className="fw-bold text-danger">{tour.price?.toLocaleString()} đ</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="custom-btn btn-sm btn-edit py-2 px-3" onClick={() => handleEdit(tour)} disabled={deletingId === tour._id}>
                                                <Edit3 size={14}/>
                                            </button>
                                            <button 
                                                className="custom-btn btn-sm btn-delete py-2 px-3" 
                                                onClick={() => confirmDelete(tour)} 
                                                disabled={deletingId === tour._id}
                                            >
                                                {deletingId === tour._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14}/>}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TourForm;