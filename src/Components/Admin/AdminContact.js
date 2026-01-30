import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col, Card, Modal, Badge, Stack } from 'react-bootstrap';
import axios from 'axios';

const AdminContact = () => {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ start: '', end: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data.data);
      setFiltered(res.data.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu!");
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let temp = [...contacts];
    if (filter.start) temp = temp.filter(c => new Date(c.createdAt) >= new Date(filter.start));
    if (filter.end) {
      const endDate = new Date(filter.end);
      endDate.setHours(23, 59, 59);
      temp = temp.filter(c => new Date(c.createdAt) <= endDate);
    }
    setFiltered(temp);
  }, [filter, contacts]);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Chưa xử lý' ? 'Đã xử lý' : 'Chưa xử lý';
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/contacts/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContacts(contacts.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } catch (err) {
      alert("Lỗi khi cập nhật!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(contacts.filter(c => c._id !== id));
      } catch (err) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  return (
    <Container className="py-5">
      {/* CSS Custom cho toàn bộ hệ thống nút */}
      <style>{`
        /* Style chung cho Nút Bạc */
        .btn-silver {
          background-color: #e9ecef;
          border: 1px solid #dee2e6;
          color: #495057;
          font-weight: 600;
          transition: all 0.25s ease-in-out;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
        }

        /* Hiệu ứng Hover cho từng loại nút */
        .btn-refresh:hover { background-color: #6c757d !important; color: white !important; border-color: #6c757d !important; }
        .btn-view:hover { background-color: #0dcaf0 !important; color: white !important; border-color: #0dcaf0 !important; }
        .btn-status:hover { background-color: #198754 !important; color: white !important; border-color: #198754 !important; }
        .btn-delete:hover { background-color: #dc3545 !important; color: white !important; border-color: #dc3545 !important; }
        .btn-close-modal:hover { background-color: #343a40 !important; color: white !important; }

        /* Căn chỉnh bảng */
        .table-align-middle td { vertical-align: middle; padding: 1rem 0.75rem; }
        .card-custom { border-radius: 15px; border: none; }
      `}</style>

      <Card className="p-4 shadow-sm card-custom">
        <h3 className="fw-bold mb-4 text-secondary text-center text-md-start">QUẢN LÝ PHẢN HỒI</h3>
        
        {/* BỘ LỌC */}
        <Row className="mb-4 bg-light p-3 rounded mx-0 shadow-sm border align-items-end">
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Label className="small fw-bold text-muted">TỪ NGÀY</Form.Label>
            <Form.Control type="date" value={filter.start} onChange={e => setFilter({...filter, start: e.target.value})} />
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <Form.Label className="small fw-bold text-muted">ĐẾN NGÀY</Form.Label>
            <Form.Control type="date" value={filter.end} onChange={e => setFilter({...filter, end: e.target.value})} />
          </Col>
          <Col md={4}>
            <Button 
              className="btn-silver btn-refresh w-100 py-2" 
              onClick={() => {setFilter({start:'', end:''}); fetchData();}}
            >
              LÀM MỚI
            </Button>
          </Col>
        </Row>

        {/* BẢNG DỮ LIỆU */}
        <Table responsive hover className="table-align-middle">
          <thead className="table-light">
            <tr className="small text-muted">
              <th>NGƯỜI GỬI</th>
              <th>NGÀY GỬI</th>
              <th>TRẠNG THÁI</th>
              <th className="text-center">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? filtered.map(c => (
              <tr key={c._id}>
                <td>
                  <div className="fw-bold text-dark">{c.fullName}</div>
                  <div className="small text-secondary">{c.email}</div>
                </td>
                <td>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>
                  <Badge bg={c.status === 'Đã xử lý' ? 'success' : 'secondary'} className="px-3 py-2 fw-normal">
                    {c.status || 'Chưa xử lý'}
                  </Badge>
                </td>
                <td>
                  <Stack direction="horizontal" gap={2} className="justify-content-center">
                    <Button className="btn-silver btn-view px-3" onClick={() => setSelected(c)}>
                      CHI TIẾT
                    </Button>
                    <Button 
                      className="btn-silver btn-status px-3"
                      onClick={() => handleUpdateStatus(c._id, c.status || 'Chưa xử lý')}
                    >
                      {c.status === 'Đã xử lý' ? 'HOÀN TÁC' : 'XỬ LÝ'}
                    </Button>
                    <Button className="btn-silver btn-delete px-3" onClick={() => handleDelete(c._id)}>
                      XÓA
                    </Button>
                  </Stack>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="text-center py-5 text-muted">Không tìm thấy dữ liệu phản hồi nào.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* MODAL CHI TIẾT */}
      <Modal show={!!selected} onHide={() => setSelected(null)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-uppercase w-100 text-center">Chi Tiết Liên Hệ</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {selected && (
            <div className="p-4 bg-light rounded-4 border shadow-sm">
              <Row className="gy-4">
                <Col md={6}>
                  <label className="d-block small text-muted fw-bold mb-1">HỌ TÊN</label>
                  <div className="p-2 bg-white rounded border fw-bold">{selected.fullName}</div>
                </Col>
                <Col md={6}>
                  <label className="d-block small text-muted fw-bold mb-1">LOẠI THÔNG TIN</label>
                  <div className="p-2 bg-white rounded border">{selected.type}</div>
                </Col>
                <Col md={6}>
                  <label className="d-block small text-muted fw-bold mb-1">ĐIỆN THOẠI</label>
                  <div className="p-2 bg-white rounded border">{selected.phone}</div>
                </Col>
                <Col md={6}>
                  <label className="d-block small text-muted fw-bold mb-1">EMAIL</label>
                  <div className="p-2 bg-white rounded border">{selected.email}</div>
                </Col>
                <Col md={12}>
                  <label className="d-block small text-muted fw-bold mb-1">NỘI DUNG PHẢN HỒI</label>
                  <div className="p-3 bg-white rounded border" style={{ minHeight: '150px', whiteSpace: 'pre-line' }}>
                    {selected.message}
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button variant="silver" className="btn-silver btn-close-modal px-5 py-2" onClick={() => setSelected(null)}>
            ĐÓNG CỬA SỔ
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminContact;