import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';

function AdminCustomTourPage() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({ finalPrice: '', notes: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/custom-tours`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(res.data.data.requests);
      } catch (err) {
        console.error('Không thể tải danh sách yêu cầu:', err);
      }
    };
    fetchRequests();
  }, [token]);

  const handleConfirm = (req) => {
    setSelected(req);
    setShow(true);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/custom-tours/${selected._id}/confirm`,
        {
           numberOfPeople: formData.numberOfPeople,
            startDate: formData.startDate,
          finalPrice: formData.finalPrice
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message);
      setShow(false);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Xác nhận thất bại!');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Danh sách yêu cầu tour tùy chỉnh</h2>
     <Table striped bordered hover>
  <thead>
    <tr>
      <th>Khách hàng</th>
      <th>Điểm đến</th>
      <th>Số ngày</th>
      <th>Ngày khởi hành</th>
      <th>Số lượng người</th>
      <th>Trạng thái</th>
      <th>Hành động</th>
    </tr>
  </thead>
  <tbody>
    {requests.map((req) => (
      <tr key={req._id}>
        <td>{req.user?.username}</td>
        <td>{req.destination}</td>
        <td>{req.durationDays} ngày</td>
        <td>
          {req.startDate
            ? new Date(req.startDate).toLocaleDateString('vi-VN')
            : 'Chưa chọn'}
        </td>
        <td>{req.numberOfPeople || '—'}</td>
        <td>{req.status}</td>
        <td>
          {req.status === 'pending' ? (
            <Button variant="success" onClick={() => handleConfirm(req)}>
              Xác nhận
            </Button>
          ) : (
            'Đã xác nhận'
          )}
        </td>
      </tr>
    ))}
  </tbody>
</Table>

     <Modal show={show} onHide={() => setShow(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Xác nhận tour tùy chỉnh</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      {/* ✅ Ngày khởi hành */}
      <Form.Group className="mt-2">
        <Form.Label>Ngày khởi hành</Form.Label>
        <Form.Control
          type="date"
          name="startDate"
          value={formData.startDate || ''}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          required
        />
      </Form.Group>

      {/* ✅ Số lượng người */}
      <Form.Group className="mt-2">
        <Form.Label>Số lượng người</Form.Label>
        <Form.Control
          type="number"
          name="numberOfPeople"
          value={formData.numberOfPeople || ''}
          onChange={(e) => setFormData({ ...formData, numberOfPeople: e.target.value })}
          placeholder="Ví dụ: 4"
          min="1"
          required
        />
      </Form.Group>

      {/* ✅ Giá cuối cùng */}
      <Form.Group className="mt-2">
        <Form.Label>Giá cuối cùng</Form.Label>
        <Form.Control
          type="number"
          name="finalPrice"
          value={formData.finalPrice}
          onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
        />
      </Form.Group>

      {/* ✅ Ghi chú */}
      <Form.Group className="mt-2">
        <Form.Label>Ghi chú</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShow(false)}>
      Hủy
    </Button>
    <Button variant="primary" onClick={handleSubmit}>
      Xác nhận
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
}

export default AdminCustomTourPage;
