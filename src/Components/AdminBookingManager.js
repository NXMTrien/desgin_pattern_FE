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
      // Gọi đúng route dành cho Admin mà bạn đã viết ở Backend
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Theo Backend của bạn: res.data.data.bookings
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

  // Tính tổng tiền cho danh sách đang hiển thị
  const totalRevenue = filteredBookings
    .filter(b => b.status !== 'cancelled') // Không tính đơn đã hủy
    .reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  // Xử lý dữ liệu cho biểu đồ (Doanh thu theo 12 tháng)
  const monthlyData = new Array(12).fill(0);
  filteredBookings.forEach(b => {
    if (b.status !== 'cancelled') {
        const month = new Date(b.createdAt).getMonth();
        monthlyData[month] += b.totalPrice;
    }
  });

  const chartData = {
    labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: monthlyData,
        backgroundColor: 'rgba(0, 84, 165, 0.8)',
        borderColor: '#0054a5',
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  if (loading) return <div className="text-center p-5">Đang tải dữ liệu hệ thống...</div>;

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <div className="row mb-4">
        <div className="col">
          <h3 className="fw-bold text-dark d-flex align-items-center">
            <BarChart3 className="me-2 text-primary" /> BÁO CÁO DOANH THU & BOOKING
          </h3>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 bg-primary text-white">
            <div className="d-flex justify-content-between">
              <div>
                <p className="mb-1 opacity-75">Tổng doanh thu (Lọc)</p>
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
                <p className="mb-1 text-muted">Số lượng đơn đặt</p>
                <h3 className="fw-bold">{filteredBookings.length} đơn</h3>
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
                    {filteredBookings.filter(b => b.status === 'cancelled').length} đơn
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
              <input type="date" className="form-control form-control-lg border-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="small mb-1 fw-semibold text-muted">Đến ngày</label>
              <input type="date" className="form-control form-control-lg border-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm" onClick={handleFilter}>
              LỌC DỮ LIỆU
            </button>
            <button className="btn btn-outline-secondary w-100 mt-2 py-2 fw-bold border-2" onClick={() => { setStartDate(""); setEndDate(""); setFilteredBookings(bookings); }}>
              LÀM MỚI
            </button>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5 className="fw-bold mb-4">Biểu đồ doanh thu năm {new Date().getFullYear()}</h5>
            <div style={{ height: "300px" }}>
              <Bar 
                data={chartData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } }
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-bold">Chi tiết danh sách Booking</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small uppercase text-center">
                <th>Mã đơn</th>
                <th className="text-start">Khách hàng</th>
                <th className="text-start">Tour đã đặt</th>
                <th>Ngày khởi hành</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b._id} className="text-center">
                  <td className="fw-bold text-primary">#{b._id.slice(-6).toUpperCase()}</td>
                  <td className="text-start">
                    <div className="fw-bold">{b.user?.username || "Ẩn danh"}</div>
                    <div className="small text-muted">{b.user?.email}</div>
                  </td>
                  <td className="text-start">
                    <span className="fw-semibold text-dark">{b.tour?.title || b.customTour?.title || "Custom Tour"}</span>
                    <div className="small text-muted">{b.numberOfPeople} người</div>
                  </td>
                  <td>{new Date(b.startDate).toLocaleDateString('vi-VN')}</td>
                  <td className="fw-bold">{(b.totalPrice || 0).toLocaleString()} đ</td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-2 ${
                      b.status === 'confirmed' ? 'bg-success' : 
                      b.status === 'pending_payment' ? 'bg-warning text-dark' : 
                      b.status === 'cancelled' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {b.status === 'confirmed' ? 'Đã thanh toán' : 
                       b.status === 'pending_payment' ? 'Chờ thanh toán' : 
                       b.status === 'cancelled' ? 'Đã hủy' : b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingManager;