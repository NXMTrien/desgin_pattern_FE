import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
    Upload, Image, Loader2, MapPin, Calendar, Edit3, 
    Trash2, XCircle, DollarSign, Users, Clock, FileText, Info, PlusCircle, Navigation
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
    const [editingTourId, setEditingTourId] = useState(null);
    const [formData, setFormData] = useState({
        title: "", destination: "", duration: 1, category: "", price: "",
        maxGroupSize: "", description: "", startLocation: "TP. Hồ Chí Minh",
        startDates: [], currentDateInput: "",
        blogTitle: "", blogDetail: "", blogMeaningfulDescription: "",
        itinerary: []
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

    useEffect(() => {
        const numDays = parseInt(formData.duration) || 1;
        const newItinerary = Array.from({ length: numDays }, (_, i) => ({
            day: i + 1,
            content: formData.itinerary[i]?.content || ""
        }));
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    }, [formData.duration]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/categories", { headers: getAuthHeaders() });
            setCategories(res.data.data.categories || []);
        } catch (error) { console.error(error); }
    };

    const fetchTours = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/tours");
            setTours(res.data.data.tours || []);
        } catch (error) { console.error(error); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItineraryChange = (index, value) => {
        const updatedItinerary = [...formData.itinerary];
        updatedItinerary[index].content = value;
        setFormData({ ...formData, itinerary: updatedItinerary });
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'imageCover') {
            const file = files[0];
            setImageCover(file);
            setPreviews(p => ({ ...p, cover: file ? URL.createObjectURL(file) : null }));
        } else if (name === 'images') {
            const selectedFiles = Array.from(files).slice(0, 5);
            setOtherImages(selectedFiles);
            setPreviews(p => ({ ...p, others: selectedFiles.map(f => URL.createObjectURL(f)) }));
        }
    };

    const addDate = () => {
        if (!formData.currentDateInput) return;
        if (formData.startDates.includes(formData.currentDateInput)) {
            alert("❌ Lỗi: Ngày này đã có trong danh sách lịch khởi hành!");
            return;
        }
        setFormData({
            ...formData,
            startDates: [...formData.startDates, formData.currentDateInput].sort(),
            currentDateInput: ""
        });
    };

    const removeDate = (dateToRemove) => {
        setFormData({ ...formData, startDates: formData.startDates.filter(d => d !== dateToRemove) });
    };

    const resetForm = () => {
        setEditingTourId(null);
        setFormData({
            title: "", destination: "", duration: 1, category: "", price: "",
            maxGroupSize: "", description: "", startLocation: "TP. Hồ Chí Minh", 
            startDates: [], currentDateInput: "",
            blogTitle: "", blogDetail: "", blogMeaningfulDescription: "", itinerary: []
        });
        setImageCover(null);
        setOtherImages([]);
        setPreviews({ cover: null, others: [] });
    };

    const handleEdit = (tour) => {
        setEditingTourId(tour._id);
        
        // CHỈ nạp dữ liệu Tour, KHÔNG nạp dữ liệu Blog
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
            currentDateInput: "",
            // Reset các trường blog về rỗng khi chỉnh sửa
            blogTitle: "",
            blogDetail: "",
            blogMeaningfulDescription: "",
            itinerary: [] 
        });
        
        // Cuộn lên đầu trang
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (tour) => {
        if (!window.confirm(`Bạn có chắc muốn xóa: ${tour.title}?`)) return;
        try {
            await axios.delete(`http://localhost:5000/api/tours/${tour._id}`, { headers: getAuthHeaders() });
            setMessage("✅ Xóa tour thành công!");
            fetchTours();
        } catch (err) {
            setMessage(`❌ Lỗi: ${err.response?.data?.message || "Không thể xóa"}`);
        }
        setTimeout(() => setMessage(""), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const tourFormData = new FormData();
            
            // Xử lý các trường cơ bản của Tour
            Object.keys(formData).forEach(key => {
                if (key === 'startDates') {
                    formData.startDates.forEach(date => tourFormData.append('startDate', date));
                } else if (!key.startsWith('blog') && key !== 'itinerary' && key !== 'currentDateInput') {
                    tourFormData.append(key, formData[key]);
                }
            });

            // CHỈ gửi dữ liệu Blog nếu là THÊM MỚI (không phải đang sửa)
            if (!editingTourId) {
                const attractionsString = formData.itinerary.map(item => `Ngày ${item.day}: ${item.content}`).join('\n');
                tourFormData.append('blogAttractions', attractionsString);
                tourFormData.append('blogTitle', formData.blogTitle);
                tourFormData.append('blogDetail', formData.blogDetail);
                tourFormData.append('blogMeaningfulDescription', formData.blogMeaningfulDescription);
            }

            if (imageCover) tourFormData.append('imageCover', imageCover);
            otherImages.forEach(file => tourFormData.append('images', file));

            const url = editingTourId ? `http://localhost:5000/api/tours/${editingTourId}` : `http://localhost:5000/api/tours`;
            const method = editingTourId ? 'patch' : 'post';

            await axios[method](url, tourFormData, {
                headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
            });

            setMessage(editingTourId ? "✅ Cập nhật tour thành công!" : "✅ Tạo tour thành công!");
            resetForm();
            fetchTours();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setMessage(`❌ Lỗi: ${err.response?.data?.message || "Thao tác thất bại"}`);
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setMessage(""), 5000);
        }
    };

    if (role !== "admin") return <div className="container mt-5 alert alert-danger">❌ Quyền admin yêu cầu.</div>;

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
                .itinerary-day-box { border-left: 3px solid #dee2e6; padding-left: 15px; margin-bottom: 15px; }
                .sticky-actions { position: sticky; bottom: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); padding: 15px; z-index: 1000; border-top: 1px solid #eee; border-radius: 0 0 12px 12px; }
            `}</style>

            <header className="text-center mb-5">
                <h2 className="fw-bold text-uppercase">{editingTourId ? "🔄 Chỉnh sửa Tour" : "➕ Thêm Mới Tour & Blog"}</h2>
                <p className="text-muted">Quản lý nội dung Tour chuyên nghiệp</p>
            </header>

            {message && (
                <div className={`alert fixed-top mx-auto mt-3 shadow-lg border-0 ${message.startsWith('✅') ? 'alert-success' : 'alert-danger'}`} style={{ width: 'fit-content', zIndex: 9999 }}>
                    <div className="d-flex align-items-center gap-2 px-3">
                        {message}
                        <XCircle size={18} className="cursor-pointer" onClick={() => setMessage("")} />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* PHẦN 1: THÔNG TIN CHUNG */}
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
                            <label className="form-label fw-bold small text-muted text-primary">THÊM LỊCH KHỞI HÀNH</label>
                            <div className="input-group">
                                <input type="date" className="form-control" value={formData.currentDateInput} onChange={(e) => setFormData({...formData, currentDateInput: e.target.value})} />
                                <button type="button" className="btn btn-primary" onClick={addDate}><PlusCircle size={18}/></button>
                            </div>
                        </div>
                        <div className="col-12 d-flex flex-wrap gap-2">
                            {formData.startDates.map(date => (
                                <span key={date} className="badge bg-primary-subtle text-primary border p-2">
                                    {new Date(date).toLocaleDateString('vi-VN')}
                                    <XCircle size={14} className="ms-2 cursor-pointer" onClick={() => removeDate(date)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* PHẦN 2: LỊCH TRÌNH CHI TIẾT (Itinerary này của Tour) */}
                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">2. Giá & Thời lượng</h6>
                    <div className="row g-3 mb-4">
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
                    </div>
                </div>

                {/* PHẦN 3: HÌNH ẢNH & BLOG (Ẩn Blog khi Sửa) */}
                <div className="form-section shadow-sm">
                    <h6 className="section-title fw-bold">3. Hình ảnh { !editingTourId && "& Blog bài viết" }</h6>
                    <div className="row g-4 mb-4">
                        <div className="col-md-6 border-end">
                            <label className="form-label fw-bold small">ẢNH BÌA CHÍNH</label>
                            <input type="file" name="imageCover" className="form-control mb-2" onChange={handleFileChange} />
                            {previews.cover && <img src={previews.cover} className="preview-img w-100 h-auto" style={{maxHeight:'180px'}} />}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold small">ALBUM ẢNH PHỤ</label>
                            <input type="file" name="images" className="form-control mb-2" onChange={handleFileChange} multiple />
                            <div className="d-flex flex-wrap gap-2">{previews.others.map((s,i) => <img key={i} src={s} className="preview-img" />)}</div>
                        </div>
                    </div>
                    
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label fw-bold small text-muted">MÔ TẢ NGẮN TOUR</label>
                            <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange} required></textarea>
                        </div>

                        {/* CHỈ HIỆN KHI THÊM MỚI */}
                        {!editingTourId && (
                            <>
                                <hr />
                                <div className="col-12">
                                    <label className="form-label fw-bold small">TIÊU ĐỀ BÀI VIẾT (BLOG)</label>
                                    <input type="text" name="blogTitle" className="form-control" value={formData.blogTitle} onChange={handleChange} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-bold small">CHƯƠNG TRÌNH NỔI BẬT (BLOG)</label>
                                    <textarea name="blogDetail" className="form-control" rows="4" value={formData.blogDetail} onChange={handleChange}></textarea>
                                </div>
                                <div className="bg-light p-3 rounded-3 border">
                                    <label className="form-label fw-bold mb-3 small">NỘI DUNG LỊCH TRÌNH BLOG (TỪNG NGÀY):</label>
                                    {formData.itinerary.map((item, index) => (
                                        <div key={index} className="itinerary-day-box">
                                            <div className="fw-bold text-primary mb-1 small">NGÀY {item.day}</div>
                                            <input 
                                                type="text" 
                                                className="form-control border-0 shadow-sm" 
                                                placeholder={`VD: Tham quan bảo tàng, ăn tối trên tàu...`}
                                                value={item.content}
                                                onChange={(e) => handleItineraryChange(index, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="sticky-actions shadow-lg d-flex gap-3 justify-content-center">
                    <button type="submit" className={`custom-btn btn-lg px-5 ${editingTourId ? 'btn-update' : 'btn-save'}`} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (editingTourId ? "CẬP NHẬT TOUR" : "TẠO TOUR")}
                    </button>
                    {editingTourId && <button type="button" className="custom-btn btn-lg px-4 btn-cancel" onClick={resetForm}>HỦY BỎ</button>}
                </div>
            </form>

            <div className="mt-5">
                <h4 className="fw-bold mb-4">📋 Danh sách Tour hiện tại</h4>
                <div className="table-responsive shadow-sm border rounded-3 bg-white">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">STT</th>
                                <th>Tiêu đề</th>
                                <th>Nơi khởi hành</th>
                                <th>Điểm đến</th>
                                <th>Giá bán</th>
                                <th className="text-center">Quản lý</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tours.map((tour, index) => (
                                <tr key={tour._id} className={editingTourId === tour._id ? "table-warning" : ""}>
                                    <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                    <td>
                                        <div className="fw-bold">{tour.title}</div>
                                        <div className="small text-muted">{tour.duration} Ngày | {tour.category?.name}</div>
                                    </td>
                                    <td><span className="badge bg-light text-dark border"><Navigation size={12} className="me-1"/> {tour.startLocation}</span></td>
                                    <td><div className="small"><MapPin size={12} className="text-danger me-1"/>{tour.destination}</div></td>
                                    <td className="fw-bold text-danger">{tour.price?.toLocaleString()} đ</td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <button className="custom-btn btn-sm btn-edit py-2 px-3" onClick={() => handleEdit(tour)}><Edit3 size={14}/></button>
                                            <button className="custom-btn btn-sm btn-delete py-2 px-3" onClick={() => handleDelete(tour)}><Trash2 size={14}/></button>
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