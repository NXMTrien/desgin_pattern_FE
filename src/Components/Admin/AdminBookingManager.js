import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Calendar, DollarSign, List, BarChart3, Filter } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminBookingManager = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = res.data.data.bookings;
      setBookings(data);
      setFilteredBookings(data);
      setLoading(false);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (!startDate || !endDate) {
      setFilteredBookings(bookings);
      return;
    }

    const filtered = bookings.filter((b) => {
      const bDate = new Date(b.createdAt).setHours(0,0,0,0);
      const start = new Date(startDate).setHours(0,0,0,0);
      const end = new Date(endDate).setHours(0,0,0,0);
      return bDate >= start && bDate <= end;
    });
    setFilteredBookings(filtered);
  };

  // Doanh thu chỉ tính trên đơn Đã thanh toán (confirmed hoặc paid)
  const totalRevenue = filteredBookings
    .filter(b => b.status === 'confirmed' || b.status === 'paid')
    .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  // Dữ liệu biểu đồ (Chỉ tính đơn đã thanh toán)
  const monthlyData = new Array(12).fill(0);
  filteredBookings.forEach(b => {
    if (b.status === 'confirmed' || b.status === 'paid') {
        const month = new Date(b.createdAt).getMonth();
        monthlyData[month] += b.totalPrice;
    }
  });

  const chartData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Doanh thu thực tế (VNĐ)',
        data: monthlyData,
        backgroundColor: '#198754', // Màu xanh lá cho doanh thu thực
        borderRadius: 5,
      },
    ],
  };

  // --- LOGIC CHÍNH: ẨN CÁC ĐƠN ĐANG CHỜ THANH TOÁN ---
  const displayBookings = filteredBookings.filter(b => 
    b.status !== 'pending_payment' && b.status !== 'pending'
  );

  if (loading) return <div className="text-center p-5">Đang tải dữ liệu hệ thống...</div>;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <div className="row mb-4">
        <div className="col">
          <h3 className="fw-bold text-dark d-flex align-items-center">
            <BarChart3 className="me-2 text-primary" /> QUẢN LÝ DOANH THU & BOOKING
          </h3>
          <p className="text-muted small">Bảng hiển thị đơn Đã thanh toán, Đã hủy và đơn chờ xác nhận. Đơn "Chờ thanh toán" đã bị ẩn.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-success text-white">
            <div className="d-flex justify-content-between">
              <div>
                <p className="mb-1 opacity-75">Doanh thu thực nhận</p>
                <h3 className="fw-bold">{totalRevenue.toLocaleString()} đ</h3>
              </div>
              <DollarSign size={40} className="opacity-25" />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white">
            <div className="d-flex justify-content-between">
              <div>
                <p className="mb-1 text-muted">Số lượng đơn hiển thị</p>
                <h3 className="fw-bold text-dark">{displayBookings.length} đơn</h3>
              </div>
              <List size={40} className="text-light" />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-white border-start border-danger border-4">
            <div className="d-flex justify-content-between">
              <div>
                <p className="mb-1 text-muted">Đơn đã hủy</p>
                <h3 className="fw-bold text-danger">
                    {displayBookings.filter(b => b.status === 'cancelled').length} đơn
                </h3>
              </div>
              <Calendar size={40} className="text-light" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Chart Section */}
      <div className="row mb-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <Filter size={18} className="me-2" /> Bộ lọc thời gian
            </h5>
            <div className="mb-3">
              <label className="small mb-1 fw-semibold text-muted">Từ ngày</label>
              <input type="date" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="small mb-1 fw-semibold text-muted">Đến ngày</label>
              <input type="date" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleFilter}>LỌC DỮ LIỆU</button>
            <button className="btn btn-link btn-sm w-100 mt-2 text-decoration-none text-muted" onClick={() => { setStartDate(""); setEndDate(""); setFilteredBookings(bookings); }}>Thiết lập lại</button>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-4">Biểu đồ doanh thu năm {new Date().getFullYear()}</h5>
            <div style={{ height: "250px" }}>
              <Bar data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold text-secondary">Danh sách chi tiết</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small uppercase text-center">
                <th>Mã đơn</th>
                <th className="text-start">Khách hàng</th>
                <th className="text-start">Tour</th>
                <th>Ngày đi</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {displayBookings.length > 0 ? (
                displayBookings.map((b) => (
                  <tr key={b._id} className="text-center">
                    <td className="fw-bold text-primary">#{b._id.slice(-6).toUpperCase()}</td>
                    <td className="text-start">
                      <div className="fw-bold">{b.user?.username || "Khách vãng lai"}</div>
                      <div className="small text-muted">{b.user?.email}</div>
                    </td>
                    <td className="text-start">
                      <div className="fw-semibold text-dark text-truncate" style={{maxWidth: '220px'}}>
                        {b.tour?.title || b.customTour?.title || "Custom Tour"}
                      </div>
                      <div className="small text-muted">{b.numberOfPeople} người</div>
                    </td>
                    <td>{new Date(b.startDate).toLocaleDateString('vi-VN')}</td>
                    <td className="fw-bold">{(b.totalPrice || 0).toLocaleString()} đ</td>
                    <td>
                      <span className={`badge rounded-pill px-3 py-2 ${
                        (b.status === 'confirmed' || b.status === 'paid') ? 'bg-success' : 
                        b.status === 'cancelled' ? 'bg-danger' : 
                        'bg-info text-dark'
                      }`}>
                        {/* Hiển thị thống nhất 'Đã thanh toán' cho cả confirmed và paid */}
                        {(b.status === 'confirmed' || b.status === 'paid') ? 'Đã thanh toán' : 
                         b.status === 'cancelled' ? 'Đã hủy' : 
                         b.status === 'awaiting_confirmation' ? 'Chờ xác nhận' : b.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">Không có dữ liệu phù hợp để hiển thị.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingManager;