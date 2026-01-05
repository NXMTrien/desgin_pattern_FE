import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Upload, Image, Loader2, MapPin, Calendar, Edit3, Trash2, XCircle } from 'lucide-react';

const handleAuthError = (setMessage, setRole) => {
    setMessage("⚠️ Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setRole("guest"); 
};

const TourForm = () => {
    // --- STATE QUẢN LÝ CHẾ ĐỘ SỬA ---
    const [editingTourId, setEditingTourId] = useState(null);

    const [formData, setFormData] = useState({
        title: "", destination: "", duration: "", category: "", price: "",
        maxGroupSize: "", description: "", startLocation: "", startDates: [],currentDateInput: "",
        blogTitle: "", blogDetail: "", blogAttractions: "", blogMeaningfulDescription: "",
    });
    
    const [imageCover, setImageCover] = useState(null);
    const [otherImages, setOtherImages] = useState([]); 
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
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/categories", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setCategories(res.data.data.categories || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTours = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/tours");
            setTours(res.data.data.tours || []);
        } catch (error) { console.error(error); }
    };

    // --- HÀM KÍCH HOẠT CHẾ ĐỘ SỬA ---
    const handleEdit = (tour) => {
        setEditingTourId(tour._id);
        setFormData({
            title: tour.title || "",
            destination: tour.destination || "",
            duration: tour.duration || "",
            category: tour.category?._id || tour.category || "",
            price: tour.price || "",
            maxGroupSize: tour.maxGroupSize || "",
            description: tour.description || "",
            startLocation: tour.startLocation || "",
            startDates: Array.isArray(tour.startDate) 
            ? tour.startDate.map(date => new Date(date).toISOString().split('T')[0]) 
            : [],
            currentDateInput: "",
            // Phần Blog (nếu backend trả về kèm tour)
            blogTitle: tour.blog?.title || "",
            blogDetail: tour.blog?.description?.detail || "",
            blogAttractions: tour.blog?.description?.attractions || "",
            blogMeaningfulDescription: tour.blog?.description?.meaningful_description || "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const addDate = () => {
    if (!formData.currentDateInput) return;
    if (formData.startDates.includes(formData.currentDateInput)) {
        alert("Ngày này đã có trong danh sách!");
        return;
    }
    setFormData({
        ...formData,
        startDates: [...formData.startDates, formData.currentDateInput].sort(),
        currentDateInput: ""
    });
};

const removeDate = (dateToRemove) => {
    setFormData({
        ...formData,
        startDates: formData.startDates.filter(date => date !== dateToRemove)
    });
};

    // --- HÀM XÓA TOUR ---
    // --- HÀM XÓA TOUR ---
const handleDelete = async (tour) => {
    // 1. Kiểm tra nhanh tại Frontend: Nếu có ngày khởi hành thì chặn luôn
    // Lưu ý: Kiểm tra cả 'startDate' và 'startDates' tùy theo dữ liệu backend trả về
    const dates = tour.startDate 
    
    if (dates && dates.length > 0) {
        setMessage(`⚠️ Không thể xóa: Tour này đang có ${dates.length} lịch khởi hành. Hãy đợi chuyến đi kết thúc nhé!`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => setMessage(""), 6000);
        return; // Dừng hàm, không gọi API
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tour: ${tour.title}?`)) return;

    try {
       
        await axios.delete(`http://localhost:5000/api/tours/${tour._id}`, { 
            headers: getAuthHeaders() 
        });

        setMessage("✅ Đã xóa tour thành công!");
        fetchTours(); // Tải lại danh sách mới nhất
        if (editingTourId === tour._id) resetForm();

    } catch (err) {
        if (err.response && err.response.status === 404) {
            setMessage("❌ Lỗi: Tour này không tồn tại hoặc đã bị xóa trước đó.");
            fetchTours(); 
        } else {
            const serverMsg = err.response?.data?.message || "Lỗi hệ thống khi xóa.";
            setMessage(`❌ Không thể xóa: ${serverMsg}`);
        }
    }
    setTimeout(() => setMessage(""), 6000);
};
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (name === 'imageCover') {
            setImageCover(files[0] || null);
        } else if (name === 'images') {
            if (files.length > 5) {
                setMessage("⚠️ Tối đa 5 ảnh phụ!");
                return;
            }
            setOtherImages(Array.from(files));
        }
    };

    const resetForm = () => {
    setEditingTourId(null);
    setFormData({
        title: "", 
        destination: "", 
        duration: "", 
        category: "", 
        price: "", 
        maxGroupSize: "", 
        description: "",
        startLocation: "", 
        startDates: [], 
        currentDateInput: "",
        blogTitle: "", 
        blogDetail: "", 
        blogAttractions: "", 
        blogMeaningfulDescription: "" 
    });
    setImageCover(null);
    setOtherImages([]);
};
   const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setMessage(""); // Xóa thông báo cũ

    try {
        const tourFormData = new FormData();

        // Append dữ liệu tour
        Object.keys(formData).forEach(key => {
            if (key === 'startDates') {
                formData.startDates.forEach(date => tourFormData.append('startDate', date));
            } else if (key !== 'currentDateInput' && !key.startsWith('blog')) {
                tourFormData.append(key, formData[key] || "");
            }
        });

        if (imageCover instanceof File) tourFormData.append('imageCover', imageCover);
        if (otherImages.length > 0) {
            otherImages.forEach(file => tourFormData.append('images', file));
        }

        if (editingTourId) {
            // --- CHẾ ĐỘ CẬP NHẬT ---
            await axios.patch(`http://localhost:5000/api/tours/${editingTourId}`, tourFormData, {
                headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
            });
            setMessage("✅ Cập nhật thông tin tour thành công!");
        } else {
            // --- CHẾ ĐỘ TẠO MỚI ---
            // (Giả định logic POST tour + blog của bạn ở đây)
            await axios.post(`http://localhost:5000/api/tours`, tourFormData, {
                headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
            });
            setMessage("✅ Tạo tour mới thành công!");
        }

        // --- SAU KHI THÀNH CÔNG ---
        resetForm();      // Reset các ô nhập liệu và chế độ sửa
        fetchTours();     // Tải lại danh sách tour mới
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên xem thông báo

    } catch (err) {
        console.error("Lỗi API:", err.response?.data);
        setMessage(`❌ ${err.response?.data?.message || "Lỗi không xác định."}`);
    } finally {
        setIsSubmitting(false);
        // Tự động ẩn thông báo sau 5 giây
        setTimeout(() => setMessage(""), 5000);
    }
};
    if (role !== "admin") return <div className="container mt-5 alert alert-danger">❌ Quyền admin yêu cầu.</div>;

    return (
        <div className="container mt-5 mb-5">
            <h2 className="text-center fw-bold text-uppercase">
                {editingTourId ? "🔄 Chỉnh sửa Tour" : " Tạo Tour Kèm Blog"}
            </h2>
            <div className="text-center text-muted mb-3">{editingTourId && "Bạn đang trong chế độ chỉnh sửa thông tin tour"}</div>
            <hr />
            
           {message && (
    <div 
        className={`alert mt-3 sticky-top shadow ${message.startsWith('❌') || message.startsWith('⚠️') ? 'alert-danger' : 'alert-success'}`} 
        style={{ top: '20px', zIndex: 1050, borderRadius: '10px' }}
    >
        <div className="d-flex justify-content-between align-items-center">
            <span>{message}</span>
            <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
        </div>
    </div>
)}

            <form onSubmit={handleSubmit} className={`mt-4 p-4 rounded shadow-sm ${editingTourId ? 'bg-light border border-warning' : 'bg-white border'}`}> 
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Tiêu đề Tour</label>
                        <input type="text" name="title" className="form-control" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Điểm đến</label>
                        <input type="text" name="destination" className="form-control" value={formData.destination} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label text-primary fw-bold"><MapPin size={18} className="me-1"/> Nơi khởi hành</label>
                        <input type="text" name="startLocation" className="form-control" value={formData.startLocation} onChange={handleChange} required />
                    </div>

                    <div className="col-md-6 mb-3">
    <label className="form-label text-primary fw-bold">
        <Calendar size={18} className="me-1"/> Các ngày khởi hành
    </label>
    <div className="d-flex gap-2">
        <input 
            type="date" 
            className="form-control" 
            value={formData.currentDateInput}
            onChange={(e) => setFormData({...formData, currentDateInput: e.target.value})}
        />
        <button type="button" className="btn btn-outline-primary" onClick={addDate}>Thêm</button>
    </div>
    
    {/* Hiển thị danh sách các ngày đã chọn */}
    <div className="mt-2 d-flex flex-wrap gap-2">
        {formData.startDates?.map((date, index) => (
            <span key={index} className="badge bg-info text-dark p-2 d-flex align-items-center">
                {new Date(date).toLocaleDateString('vi-VN')}
                <XCircle 
                    size={14} 
                    className="ms-2 cursor-pointer text-danger" 
                    onClick={() => removeDate(date)}
                    style={{cursor: 'pointer'}}
                />
            </span>
        ))}
    </div>
</div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">Thời lượng (Ngày)</label>
                        <input type="number" name="duration" className="form-control" value={formData.duration} onChange={handleChange} required min="1" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">Giá (VNĐ)</label>
                        <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required min="0" />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label fw-bold">SL người tối đa</label>
                        <input type="number" name="maxGroupSize" className="form-control" value={formData.maxGroupSize} onChange={handleChange} required min="1" />
                    </div>

                    <div className="col-md-12 mb-3">
                        <label className="form-label fw-bold">Danh mục</label>
                        <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </div>

                    <div className="col-12 mb-3">
                        <label className="form-label fw-bold">Mô tả Tour (Ngắn gọn)</label>
                        <textarea name="description" className="form-control" rows="2" value={formData.description} onChange={handleChange} required></textarea>
                    </div>
                </div>
                
                <div className="row mb-4">
                    <div className="col-md-6">
                        <label className="form-label fw-bold"><Image size={16}/> Ảnh bìa {editingTourId && "(Để trống nếu giữ nguyên)"}</label>
                        <input type="file" name="imageCover" className="form-control" onChange={handleFileChange} required={!editingTourId} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold"><Upload size={16}/> Ảnh phụ {editingTourId && "(Để trống nếu giữ nguyên)"}</label>
                        <input type="file" name="images" className="form-control" onChange={handleFileChange} multiple />
                    </div>
                </div>

                {!editingTourId && (
                    <>
                        <hr className="my-4 border-2" />
                        <h3 className="text-success fw-bold">📝 Nội dung Blog kèm theo</h3>
                        <div className="row">
                            <div className="col-12 mb-3"><label className="form-label">Tiêu đề Blog</label><input type="text" name="blogTitle" className="form-control" value={formData.blogTitle} onChange={handleChange} required /></div>
                            <div className="col-12 mb-3"><label className="form-label">Mô tả chi tiết</label><textarea name="blogDetail" className="form-control" rows="3" value={formData.blogDetail} onChange={handleChange} required></textarea></div>
                            <div className="col-12 mb-3"><label className="form-label">Các điểm tham quan</label><textarea name="blogAttractions" className="form-control" rows="2" value={formData.blogAttractions} onChange={handleChange} required></textarea></div>
                            <div className="col-12 mb-3"><label className="form-label">Ý nghĩa chuyến đi</label><textarea name="blogMeaningfulDescription" className="form-control" rows="2" value={formData.blogMeaningfulDescription} onChange={handleChange} required></textarea></div>
                        </div>
                    </>
                )}

                <div className="d-flex gap-2 mt-4">
                    <button type="submit" className={`btn btn-lg flex-grow-1 ${editingTourId ? 'btn-warning' : 'btn-primary'}`} disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="animate-spin me-2"/> Đang lưu...</> : (editingTourId ? "CẬP NHẬT TOUR" : "TẠO TOUR VÀ BLOG")}
                    </button>
                    {editingTourId && (
                        <button type="button" className="btn btn-secondary btn-lg" onClick={resetForm}>
                            <XCircle className="me-1"/> HỦY
                        </button>
                    )}
                </div>
            </form>

            <TourList tours={tours} onEdit={handleEdit} onDelete={handleDelete} editingTourId={editingTourId} />
        </div>
    );
};

const TourList = ({ tours, onEdit, onDelete, editingTourId }) => (
    <div className="mt-5">
        <h3 className="fw-bold">📋 Danh sách Tour Hiện Tại</h3>
        <div className="table-responsive">
            <table className="table table-bordered table-hover mt-3 align-middle">
                <thead className="table-primary text-center">
                    <tr>
                        <th>STT</th>
                        <th>Tiêu đề</th>
                        <th>Khởi hành</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {tours.map((tour, index) => (
                        <tr key={tour._id} className={editingTourId === tour._id ? "table-warning" : ""}>
                            <td>{index + 1}</td>
                            <td className="text-start">{tour.title}</td>
                            <td>{tour.startLocation || "—"}</td>
                            <td className="fw-bold text-danger">{tour.price?.toLocaleString()} VNĐ</td>
                            <td>
                                <div className="d-flex justify-content-center gap-2">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(tour)}>
                                        <Edit3 size={16} /> Sửa
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(tour)}> 
    <Trash2 size={16} /> Xóa
</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default TourForm;