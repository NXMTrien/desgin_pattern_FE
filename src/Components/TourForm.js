import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// ------------------------------------------------------------------
// ⭐ HÀM TIỆN ÍCH: Xử lý Đăng Xuất và Token Hết Hạn
// ------------------------------------------------------------------
const handleAuthError = (setMessage, setRole) => {
    setMessage("⚠️ Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setRole("guest"); 
    // setTimeout(() => { window.location.href = '/login'; }, 2000);
};

const TourForm = () => {
    // 💡 SỬA ĐỔI: Thêm title, duration, destination và thay thế name
    const [formData, setFormData] = useState({
        title: "",          // MỚI: Tương ứng với Schema
        destination: "",    // MỚI: Tương ứng với Schema
        duration: "",       // MỚI: Tương ứng với Schema (số ngày)
        category: "",
        price: "",
        maxGroupSize: "",
        description: "",
    });
    
    const [message, setMessage] = useState("");
    const [tours, setTours] = useState([]);
    const [categories, setCategories] = useState([]);
    const [role, setRole] = useState(null); // Giữ trạng thái null để loading

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage("❌ Bạn cần đăng nhập với quyền admin để tạo tour!");
                return;
            }
            
            // Chuyển duration, price, maxGroupSize sang dạng Number cho Backend
            const dataToSend = {
                ...formData,
                duration: Number(formData.duration),
                price: Number(formData.price),
                maxGroupSize: Number(formData.maxGroupSize),
            };

            const { data: _resData } = await axios.post("http://localhost:5000/api/tours", dataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setMessage("✅ Tạo tour thành công!");
            console.log("✅ Kết quả:", _resData); 
            fetchTours();
            
            // Reset form với các trường đã cập nhật
            setFormData({
                title: "", destination: "", duration: "", category: "", price: "", maxGroupSize: "", description: "",
            });

        } catch (err) {
            console.error("❌ Lỗi khi tạo tour:", err.response || err);
            
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                handleAuthError(setMessage, setRole);
                return;
            }

            // Xử lý lỗi validation chi tiết hơn
            const errorMessage = err.response?.data?.message || err.message || "❌ Không thể tạo tour. Đã xảy ra lỗi không xác định.";
            setMessage(errorMessage);
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