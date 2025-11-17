import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Upload, Image, XCircle, Info, Ban, Loader2 } from 'lucide-react';


const handleAuthError = (setMessage, setRole) => {
    setMessage("⚠️ Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setRole("guest"); 
    // setTimeout(() => { window.location.href = '/login'; }, 2000);
};

const TourForm = () => {
   
    const [formData, setFormData] = useState({
        title: "",          
        destination: "",    
        duration: "",     
        category: "",
        price: "",
        maxGroupSize: "",
        description: "",
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
                if (storedUser?.role) {
                    userRole = storedUser.role;
                }
            } catch (e) {
                console.error("Lỗi parse user data:", e);
            }
        }
        
        setRole(userRole); 
        fetchCategories();
        fetchTours();
    }, []);

    // ... (fetchCategories và fetchTours giữ nguyên)
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/categories", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setCategories(res.data.data.categories || []);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                 handleAuthError(setMessage, setRole); 
                 return;
            }
            console.error("❌ Lỗi khi lấy danh mục:", error);
            setMessage("❌ Không thể lấy danh mục. Kiểm tra quyền hoặc token.");
        }
    };

    const fetchTours = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/tours");
            setTours(res.data.data.tours || []);
        } catch (error) {
            console.error("❌ Lỗi khi lấy danh sách tour:", error);
            setMessage("❌ Không thể tải danh sách tour.");
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

     const handleFileChange = (e) => {
        const { name, files } = e.target;
        setMessage(""); // Xóa message cũ
        
        if (name === 'imageCover') {
            setImageCover(files[0] || null);
        } else if (name === 'images') {
            // Giới hạn tối đa 5 file
            if (files.length > 5) {
                setMessage("⚠️ Bạn chỉ có thể tải lên tối đa 5 ảnh phụ!");
                // Xóa input value để người dùng phải chọn lại
                e.target.value = null; 
                setOtherImages([]);
                return;
            }
            setOtherImages(Array.from(files));
        }
    };

    const handleSubmit = async (e) => {
 e.preventDefault();
        if(isSubmitting) return; // Ngăn chặn submit kép
        
        setIsSubmitting(true);
        setMessage("Đang tạo tour...");

        // 🚨 BẮT BUỘC CÓ ẢNH BÌA TRÊN CLIENT
        if (!imageCover) {
            setMessage("❌ Vui lòng chọn một Ảnh bìa (Image Cover) cho Tour.");
            setIsSubmitting(false);
            return;
        }

 try {
 const token = localStorage.getItem("token");
 if (!token) {
 setMessage("❌ Bạn cần đăng nhập với quyền admin để tạo tour!");
                setIsSubmitting(false);
 return;
 }

            // 🚨 SỬ DỤNG FormData để gửi cả file và text
            const formDataToSend = new FormData();
            
            // 1. Thêm các trường văn bản
            Object.keys(formData).forEach(key => {
                // Chuyển đổi số trước khi append
                if (['duration', 'price', 'maxGroupSize'].includes(key)) {
                    // Kiểm tra và chuyển đổi sang số, nếu rỗng thì dùng 0 (để tránh lỗi)
                    const value = formData[key] === "" ? 0 : Number(formData[key]);
                    formDataToSend.append(key, value);
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // 2. Thêm Ảnh bìa
            formDataToSend.append('imageCover', imageCover); 
            
            // 3. Thêm Ảnh phụ
            otherImages.forEach((file) => {
                formDataToSend.append('images', file); // Backend sẽ nhận mảng files dưới key 'images'
            });


 const { data: _resData } = await axios.post("http://localhost:5000/api/tours", formDataToSend, {
 headers: {
 Authorization: `Bearer ${token}`,
 },
 });

 setMessage("✅ Tạo tour thành công!");
 console.log("✅ Kết quả:", _resData); 
 fetchTours();

 // Reset form và file states
 setFormData({
title: "", destination: "", duration: "", category: "", price: "", maxGroupSize: "", description: "",
 });
            setImageCover(null);
            setOtherImages([]);

 } catch (err) {
 console.error("❌ Lỗi khi tạo tour:", err.response || err);

const status = err.response?.status;
if (status === 401 || status === 403) {
handleAuthError(setMessage, setRole);
 return;
}

const errorMessage = err.response?.data?.message || err.message || "❌ Không thể tạo tour. Đã xảy ra lỗi không xác định.";
 setMessage(errorMessage);
 } finally {
            setIsSubmitting(false);
        }
};


    // ------------------------------------------------------------------
    // 🛑 LOGIC KIỂM TRA QUYỀN (PRE-RENDER LOGIC)
    // ------------------------------------------------------------------
    
    if (role === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải thông tin người dùng...</span>
                </div>
            </div>
        );
    }
    
    if (role !== "admin") {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center">
                    ❌ Bạn không có quyền truy cập trang tạo tour.
                </div>
                <TourList tours={tours} />
            </div>
        );
    }

    // ------------------------------------------------------------------
    // ✅ RENDER FORM (CHỈ KHI role === "admin")
    // ------------------------------------------------------------------
    return (
        <div className="container mt-5">
            <h2>Tạo Tour Mới (Admin)</h2>

            <form onSubmit={handleSubmit} className="mt-4"> 
                <div className="row">
                    {/* TIÊU ĐỀ TOUR (title) */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Tiêu đề Tour</label>
                        <input
                            type="text"
                            name="title" // 💡 ĐÃ SỬA: từ 'name' sang 'title'
                            className="form-control"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* ĐIỂM ĐẾN (destination) */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Điểm đến</label>
                        <input
                            type="text"
                            name="destination" // 💡 MỚI
                            className="form-control"
                            value={formData.destination}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">Thời lượng (Số ngày)</label>
                        <input
                            type="number"
                            name="duration" // 💡 MỚI
                            className="form-control"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>

                    {/* Danh mục tour (category) */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Danh mục tour</label>
                        <select
                            name="category"
                            className="form-select"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                   
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Giá tiền (VNĐ)/Người</label>
                        <input
                            type="number"
                            name="price"
                            className="form-control"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>

                    {/* Số lượng người (maxGroupSize) */}
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Số lượng người tối đa</label>
                        <input
                            type="number"
                            name="maxGroupSize"
                            className="form-control"
                            value={formData.maxGroupSize}
                            onChange={handleChange}
                            required
                            min="1"
                        />
                    </div>

                    {/* Mô tả (description) */}
                    <div className="col-12 mb-3">
                        <label className="form-label">Mô tả tour</label>
                        <textarea
                            name="description"
                            className="form-control"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                </div>
                <div className="space-y-1">
                        <label className="block text-sm font-medium text-blue-600">
                            <Image className="inline-block mr-2 h-4 w-4"/> Ảnh bìa (Bắt buộc)
                        </label>
                        <input
                            type="file"
                            name="imageCover"
                            className="w-full p-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            onChange={handleFileChange}
                            required={!imageCover}
                            accept="image/*"
                        />
                        {imageCover && (
                            <div className="mt-2 text-sm text-green-600 flex items-center p-1 bg-green-50 rounded-md border border-green-200">
                                Đã chọn: {imageCover.name}
                                <button type="button" className="text-red-500 ml-auto hover:text-red-700 transition" onClick={() => setImageCover(null)}>
                                    <XCircle className="h-4 w-4 inline-block"/>
                                </button>
                            </div>
                        )}
                    </div>
                     <div className="space-y-1">
                        <label className="block text-sm font-medium text-indigo-600">
                             <Upload className="inline-block mr-2 h-4 w-4"/> Ảnh phụ (Tối đa 5)
                        </label>
                        <input
                            type="file"
                            name="images"
                            className="w-full p-2 border border-indigo-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={handleFileChange}
                            multiple
                            accept="image/*"
                        />
                         {otherImages.length > 0 && (
                            <div className="mt-2 text-sm text-indigo-600 flex items-center p-1 bg-indigo-50 rounded-md border border-indigo-200">
                                Đã chọn: {otherImages.length} ảnh.
                                <button type="button" className="text-red-500 ml-auto hover:text-red-700 transition" onClick={() => setOtherImages([])}>
                                    <XCircle className="h-4 w-4 inline-block"/> Xóa
                                </button>
                            </div>
                        )}
                    </div>
                <button type="submit" className="btn btn-primary">
                    Tạo Tour
                </button>
            </form>

            {message && <div className="alert alert-info mt-3">{message}</div>}

            <TourList tours={tours} />
        </div>
    );
};

// ------------------------------------------------------------------
// ✅ Danh sách tour (Giữ nguyên)
// ------------------------------------------------------------------
const TourList = ({ tours }) => (
    <>
        <h3 className="mt-5">Danh sách tour</h3>
        <table className="table table-bordered table-hover mt-3">
            <thead className="table-primary text-center">
                <tr>
                    <th>STT</th>
                    <th>Tiêu đề tour</th>
                    <th>Điểm đến</th>
                    <th>Thời lượng (Ngày)</th>
                    <th>Giá tiền (VNĐ)/Người</th>
                    <th>SL Tối đa</th>
                </tr>
            </thead>
            <tbody className="text-center">
                {tours.length > 0 ? (
                    tours.map((tour, index) => (
                        <tr key={tour._id}>
                            <td>{index + 1}</td>
                            <td>{tour.title}</td>
                            <td>{tour.destination}</td>
                            <td>{tour.duration}</td>
                            <td>{tour.price?.toLocaleString() || "—"}</td>
                            <td>{tour.maxGroupSize || "—"}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6">Chưa có tour nào được tạo</td>
                    </tr>
                )}
            </tbody>
        </table>
    </>
);

export default TourForm;