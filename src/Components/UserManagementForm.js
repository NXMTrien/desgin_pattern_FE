import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";


const API_URL = "http://localhost:5000/api/auth";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const UserManagementForm = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [role, setRole] = useState(null); 

    useEffect(() => {
  const storedRole = localStorage.getItem("role");
  const userRole = storedRole || "guest";
  setRole(userRole);

  if (userRole === "admin") {
    fetchUsers();
  } else {
    setLoading(false);
  }
}, []);

 
    const fetchUsers = async () => {
        setLoading(true);
        setError("");
        try {
            // Giả định endpoint này chỉ trả về dữ liệu nếu user có quyền Admin
            const res = await axios.get(`${API_URL}/users`, {
                headers: getAuthHeaders(),
            });
            // Giả định backend trả về 1 mảng user
            setUsers(res.data.users || res.data); 
        } catch (err) {
            console.error("Lỗi khi lấy danh sách user:", err.response?.data || err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Bạn không có quyền hoặc phiên đăng nhập đã hết hạn.");
            } else {
                setError("Không thể tải danh sách người dùng.");
            }
        } finally {
            setLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // ✅ Cập nhật Phân quyền (Role)
    // ------------------------------------------------------------------
    const handleUpdateRole = async (userId, newRole) => {
        if (!window.confirm(`Bạn có chắc chắn muốn thay đổi phân quyền của user này thành ${newRole}?`)) {
            return;
        }

        try {
            // Giả định Backend có endpoint PUT /api/users/:id
            await axios.put(`${API_URL}/users/${userId}`, 
                { role: newRole },
                { headers: getAuthHeaders() }
            );

            // Cập nhật state cục bộ
            setUsers(users.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
            alert(`✅ Cập nhật phân quyền cho user ID ${userId} thành ${newRole} thành công!`);
        } catch (err) {
            console.error("Lỗi cập nhật role:", err.response?.data || err);
            alert(`❌ Lỗi: ${err.response?.data?.message || 'Không thể cập nhật phân quyền.'}`);
        }
    };

   
    const handleBlockUser = async (user) => {
        const isBlocked = user.isBlocked || false; 
        const action = isBlocked ? "mở khóa" : "khóa";
        
        if (!window.confirm(`Bạn có chắc chắn muốn ${action} người dùng ${user.username}?`)) {
            return;
        }

        try {
           
            await axios.put(`${API_URL}/users/${user._id}`, 
                { isBlocked: !isBlocked },
                { headers: getAuthHeaders() }
            );

            // Cập nhật state cục bộ
            setUsers(users.map(u => 
                u._id === user._id ? { ...u, isBlocked: !isBlocked } : u
            ));
            alert(`✅ Đã ${action} người dùng ${user.username} thành công!`);
        } catch (err) {
            console.error(`Lỗi ${action} user:`, err.response?.data || err);
            alert(`❌ Lỗi: ${err.response?.data?.message || `Không thể ${action} người dùng.`}`);
        }
    };


    // ------------------------------------------------------------------
    // 🛑 LOGIC HIỂN THỊ
    // ------------------------------------------------------------------

    if (loading || role === null) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }
    
    if (role !== "admin") {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center">
                    ❌ Bạn không có quyền truy cập trang quản lý người dùng.
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2>Quản lý Người dùng (Admin)</h2>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            
            <table className="table table-bordered table-hover mt-3">
                <thead className="table-dark">
                    <tr>
                        <th>STT</th>
                        <th>Tên người dùng</th>
                        <th>Email</th>
                        <th>Phân quyền hiện tại</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length > 0 ? (
                        users.map((user, index) => (
                            <tr key={user._id} className={user.isBlocked ? 'table-danger' : ''}>
                                <td>{index + 1}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                
                                {/* Cột Phân quyền và Nút Update */}
                                <td>
                                    <select
                                        className="form-select form-select-sm"
                                        value={user.role}
                                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                        // Không cho phép tự thay đổi role của bản thân
                                        disabled={user.role === 'admin'} 
                                    >
                                        <option value="user">Người dùng (user)</option>
                                        <option value="admin">Quản trị viên (admin)</option>
                                    </select>
                                </td>
                                
                                {/* Cột Trạng thái */}
                                <td>
                                    {user.isBlocked ? (
                                        <span className="badge bg-danger">Đã khóa</span>
                                    ) : (
                                        <span className="badge bg-success">Hoạt động</span>
                                    )}
                                </td>

                                {/* Cột Hành động (Block/Unblock) */}
                                <td>
                                    {user.role !== 'admin' && ( // Không cho phép khóa/mở khóa Admin
                                        <button 
                                            className={`btn btn-sm ${user.isBlocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                            onClick={() => handleBlockUser(user)}
                                        >
                                            {user.isBlocked ? 'Mở khóa' : 'Khóa'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center">Không tìm thấy người dùng nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementForm;