import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = "http://localhost:5000/api/auth";

const getAuthHeaders = () => {
    // Lưu ý: Đảm bảo key trong localStorage khớp với App.js (thường là authToken)
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
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
            const res = await axios.get(`${API_URL}/users`, {
                headers: getAuthHeaders(),
            });
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

    const handleUpdateRole = async (userId, newRole) => {
        if (!window.confirm(`Xác nhận đổi phân quyền thành ${newRole}?`)) return;

        try {
            await axios.put(`${API_URL}/users/${userId}`, 
                { role: newRole },
                { headers: getAuthHeaders() }
            );
            setUsers(users.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
        } catch (err) {
            alert(`❌ Lỗi: ${err.response?.data?.message || 'Lỗi cập nhật'}`);
        }
    };

    const handleBlockUser = async (user) => {
        const isBlocked = user.isBlocked || false;
        const action = isBlocked ? "mở khóa" : "khóa";
        
        if (!window.confirm(`Bạn có chắc muốn ${action} ${user.username}?`)) return;

        try {
            await axios.put(`${API_URL}/users/${user._id}`, 
                { isBlocked: !isBlocked },
                { headers: getAuthHeaders() }
            );

            setUsers(users.map(u => 
                u._id === user._id ? { ...u, isBlocked: !isBlocked } : u
            ));
        } catch (err) {
            alert(`❌ Lỗi: ${err.response?.data?.message || 'Lỗi xử lý'}`);
        }
    };

    if (loading || role === null) {
        return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
    }

    if (role !== "admin") {
        return <div className="container mt-5 alert alert-danger text-center">❌ Không có quyền truy cập.</div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="fw-bold mb-4 text-primary">Quản lý Người dùng</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="card shadow-sm border-0">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>STT</th>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Phân quyền</th>
                            <th>Trạng thái</th>
                            <th className="text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user, index) => (
                                <tr key={user._id} className={user.isBlocked ? 'table-light opacity-75' : ''}>
                                    <td className="text-muted">{index + 1}</td>
                                    <td className="fw-bold">{user.username}</td>
                                    <td>{user.email}</td>
                                    
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            value={user.role}
                                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                            disabled={user.role === 'admin' || user.isBlocked} 
                                            title={user.isBlocked ? "Mở khóa người dùng để sửa phân quyền" : ""}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    
                                    <td>
                                        <span className={`badge rounded-pill ${user.isBlocked ? 'bg-danger' : 'bg-success'}`}>
                                            {user.isBlocked ? 'Đã khóa' : 'Đang hoạt động'}
                                        </span>
                                    </td>

                                    <td className="text-center">
                                        {user.role !== 'admin' ? (
                                            <button 
                                                className={`btn btn-sm px-3 ${user.isBlocked ? 'btn-success' : 'btn-danger'}`}
                                                onClick={() => handleBlockUser(user)}
                                            >
                                                <i className={`bi ${user.isBlocked ? 'bi-unlock' : 'bi-lock'} me-1`}></i>
                                                {user.isBlocked ? 'Mở khóa' : 'Khóa'}
                                            </button>
                                        ) : (
                                            <span className="text-muted small italic">Hệ thống</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center p-4">Không có dữ liệu.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementForm;