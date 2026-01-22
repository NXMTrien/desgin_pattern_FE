import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
// ... import các component khác như Table, Spinner

const API_URL = 'http://localhost:5000/api/blogs'; // Giả định Router chính là /api/blogs

const AdminBlogPage = () => {
    // State để quản lý dữ liệu form
    const [formData, setFormData] = useState({
        Id_Tour: '',
        title: '',
        // Khởi tạo description là một object
        description: {
            detail: '', // 1. Mô tả chi tiết
            attractions: '', // 2. Danh sách những chỗ tham quan
            meaningful_description: '', // 3. Mô tả chuyến đi ý nghĩa
        },
    });

    // ... State khác (loading, error, editMode, currentBlogId) ...

    // Hàm thay đổi các trường trong form
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'detail' || name === 'attractions' || name === 'meaningful_description') {
            // Xử lý các trường con của description
            setFormData(prevData => ({
                ...prevData,
                description: {
                    ...prevData.description,
                    [name]: value
                }
            }));
        } else {
            // Xử lý các trường cấp cao (Id_Tour, title)
            setFormData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };
    
    // Hàm xử lý gửi form (Create/Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (Logic gọi API POST hoặc PATCH) ...
        try {
            const method = 'POST'; // Thay đổi thành 'PATCH' nếu đang ở chế độ chỉnh sửa
            const url = API_URL; // Thay đổi thành `${API_URL}/${currentBlogId}` nếu đang ở chế độ chỉnh sửa

            const res = await axios({
                method,
                url,
                data: formData,
                headers: { /* ... getAuthHeaders() ... */ }
            });

            // ... (Xử lý thành công) ...

        } catch (error) {
            // ... (Xử lý lỗi) ...
        }
    };

    return (
        <Container className="my-5">
            <h2>{/* Tiêu đề */}</h2>
            <Card className="p-4">
                <Form onSubmit={handleSubmit}>
                    {/* Trường ID Tour */}
                    <Form.Group className="mb-3">
                        <Form.Label>Tour ID</Form.Label>
                        <Form.Control type="text" name="Id_Tour" value={formData.Id_Tour} onChange={handleChange} required />
                    </Form.Group>
                    
                    {/* Trường Tiêu đề */}
                    <Form.Group className="mb-3">
                        <Form.Label>Tiêu đề Blog</Form.Label>
                        <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </Form.Group>

                    <h4 className="mt-4">Nội dung Blog (Description)</h4>

                    {/* 1. Mô tả chi tiết */}
                    <Form.Group className="mb-3">
                        <Form.Label>1. Mô tả chi tiết (Detail)</Form.Label>
                        <Form.Control as="textarea" rows={5} name="detail" value={formData.description.detail} onChange={handleChange} required />
                    </Form.Group>
                    
                    {/* 2. Danh sách những chỗ tham quan */}
                    <Form.Group className="mb-3">
                        <Form.Label>2. Danh sách những chỗ tham quan (Attractions)</Form.Label>
                        <Form.Control as="textarea" rows={3} name="attractions" value={formData.description.attractions} onChange={handleChange} required />
                        <Form.Text className="text-muted">Liệt kê các điểm tham quan.</Form.Text>
                    </Form.Group>

                    {/* 3. Mô tả chuyến đi ý nghĩa hơn */}
                    <Form.Group className="mb-3">
                        <Form.Label>3. Mô tả chuyến đi để thật ý nghĩa hơn (Meaningful Description)</Form.Label>
                        <Form.Control as="textarea" rows={5} name="meaningful_description" value={formData.description.meaningful_description} onChange={handleChange} required />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3">
                        Lưu Blog
                    </Button>
                </Form>
            </Card>

            {/* Thêm phần hiển thị danh sách Blogs (Read) và nút Delete ở dưới đây */}
            {/* ... */}
        </Container>
    );
};

export default AdminBlogPage;