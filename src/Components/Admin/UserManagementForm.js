import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap"; // Cần cài đặt: npm install react-bootstrap

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const UserManagementForm = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [role, setRole] = useState(null);

    // --- State cho Modal ---
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        body: "",
        type: "confirm", // 'confirm' hoặc 'alert'
        action: null,    // Hàm sẽ thực thi nếu nhấn 'Xác nhận'
    });

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
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Bạn không có quyền hoặc phiên đăng nhập đã hết hạn.");
            } else {
                setError("Không thể tải danh sách người dùng.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Hàm mở Modal thông báo nhanh
    const showAlert = (title, body) => {
        setModalConfig({ title, body, type: "alert", action: null });
        setShowModal(true);
    };

    // Logic cập nhật Role (Đã chuyển sang dùng Modal)
    const triggerUpdateRole = (userId, newRole) => {
        setModalConfig({
            title: "Xác nhận thay đổi",
            body: `Bạn có chắc chắn muốn đổi quyền thành ${newRole.toUpperCase()}?`,
            type: "confirm",
            action: () => executeUpdateRole(userId, newRole)
        });
        setShowModal(true);
    };

    const executeUpdateRole = async (userId, newRole) => {
        try {
            await axios.put(`${API_URL}/users/${userId}`, 
                { role: newRole },
                { headers: getAuthHeaders() }
            );
            setUsers(users.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
            setShowModal(false);
        } catch (err) {
            setShowModal(false);
            setTimeout(() => showAlert("Lỗi cập nhật", err.response?.data?.message || "Không thể cập nhật quyền."), 500);
        }
    };

    // Logic Khóa/Mở khóa (Đã chuyển sang dùng Modal)
    const triggerBlockUser = (user) => {
        const isBlocked = user.isBlocked || false;
        const actionText = isBlocked ? "mở khóa" : "khóa";
        
        setModalConfig({
            title: `Xác nhận ${actionText}`,
            body: `Hành động này sẽ ${actionText} tài khoản của ${user.username}. Tiếp tục?`,
            type: "confirm",
            action: () => executeBlockUser(user)
        });
        setShowModal(true);
    };

    const executeBlockUser = async (user) => {
        const isBlocked = user.isBlocked || false;
        try {
            await axios.put(`${API_URL}/users/${user._id}`, 
                { isBlocked: !isBlocked },
                { headers: getAuthHeaders() }
            );

            setUsers(users.map(u => 
                u._id === user._id ? { ...u, isBlocked: !isBlocked } : u
            ));
            setShowModal(false);
        } catch (err) {
            setShowModal(false);
            setTimeout(() => showAlert("Lỗi hệ thống", err.response?.data?.message || "Không thể thực hiện hành động."), 500);
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
                <div className="table-responsive">
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
                                                style={{ width: '120px' }}
                                                value={user.role}
                                                onChange={(e) => triggerUpdateRole(user._id, e.target.value)}
                                                disabled={user.role === 'admin' || user.isBlocked} 
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
                                                    className={`btn btn-sm px-3 ${user.isBlocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                                                    onClick={() => triggerBlockUser(user)}
                                                >
                                                    {user.isBlocked ? 'Mở khóa' : 'Khóa'}
                                                </button>
                                            ) : (
                                                <span className="text-muted small">Mặc định</span>
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

            {/* --- CUSTOM MODAL COMPONENT --- */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className={modalConfig.type === 'alert' ? 'bg-light' : 'bg-primary text-white'}>
                    <Modal.Title className="fs-5">{modalConfig.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-4 text-center">
                    {modalConfig.body}
                </Modal.Body>
                <Modal.Footer className="border-0 justify-content-center">
                    {modalConfig.type === "confirm" ? (
                        <>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Hủy bỏ
                            </Button>
                            <Button variant="primary" onClick={modalConfig.action}>
                                Xác nhận
                            </Button>
                        </>
                    ) : (
                        <Button variant="dark" onClick={() => setShowModal(false)}>
                            Đóng
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagementForm;