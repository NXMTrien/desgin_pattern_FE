import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [tours, setTours] = useState([]); // Đồng nhất cách dùng useState
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [searchFilter, setSearchFilter] = useState({
    destination: "",
    travelDate: "",
    budget: "", // Đã thống nhất dùng budget thay vì guests
  });

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/tours/top-5-rated")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setTours(data.data.tours || []);
        }
      })
      .catch((err) => console.error("Lỗi fetch top tours:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    // Chuyển đổi object filter thành query string
    const queryParams = new URLSearchParams({
      destination: searchFilter.destination,
      travelDate: searchFilter.travelDate,
      budget: searchFilter.budget,
    }).toString();

    navigate(`/tours-users?${queryParams}`);
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

        :root {
          --brand-100: #e3f2fd;
          --brand-500: #2196f3;
          --brand-700: #1976d2;
          --muted: #6c757d;
        }

        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden; 
        }

        /* HERO FULL WIDTH */
        .hero-full {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          height: 600px;
          overflow: hidden;
        }

        .hero-full .carousel,
        .hero-full .carousel-inner,
        .hero-full .carousel-item {
          height: 100%;
        }

        .hero-full img {
          width: 100vw;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            rgba(0, 0, 0, 0.3), 
            rgba(11, 74, 122, 0.4)
          );
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* SEARCH BOX */
        .search-card {
          margin-top: -60px;
          position: relative;
          z-index: 10;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          border: none;
          background: white;
        }

        /* TOUR CARDS */
        .feature-card {
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: none;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        /* RATING BADGE - Thêm mới */
        .rating-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(255, 255, 255, 0.95);
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.85rem;
          color: #ff9800;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          z-index: 5;
        }

        .cta-btn {
          background-color: var(--brand-500);
          border-color: var(--brand-500);
          padding: 12px;
          transition: background 0.2s;
        }

        .cta-btn:hover {
          background-color: var(--brand-700);
          border-color: var(--brand-700);
        }

        .btn-detail {
          border: 1.5px solid var(--brand-500);
          color: var(--brand-500);
          font-weight: 600;
        }

        .btn-detail:hover {
          background-color: var(--brand-500);
          color: white;
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="hero-full">
        <div id="heroCarousel" className="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="4000">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src="https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA" alt="Đà Nẵng" />
            </div>
            <div className="carousel-item">
              <img src="https://samtenhills.vn/wp-content/uploads/2024/01/khong-gian-tinh-lang-va-ve-dep-nen-tho-cua-ho-tuyen-lam.jpg" alt="Đà Lạt" />
            </div>
            <div className="carousel-item">
              <img src="https://samtenhills.vn/wp-content/uploads/2024/01/trai-nghiem-du-day-vuot-thac-tai-khu-du-lich-thac-datanla.jpeg" alt="Trải nghiệm" />
            </div>
          </div>
          <div className="hero-overlay">
            <div className="text-center text-white px-3">
              <h1 className="fw-bold display-3">Khám phá Việt Nam cùng Tourify</h1>
              <p className="lead mt-3 fs-4">Hành trình tuyệt vời – Trải nghiệm đẳng cấp – Giá tốt mỗi ngày</p>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BOX */}
      <div className="container">
        <div className="card search-card p-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="small fw-bold mb-1 text-muted">Địa điểm</label>
              <input 
                className="form-control" 
                placeholder="Bạn muốn đi đâu?" 
                value={searchFilter.destination}
                onChange={(e) => setSearchFilter({...searchFilter, destination: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold mb-1 text-muted">Ngày đi</label>
              <input 
                type="date" 
                className="form-control" 
                value={searchFilter.travelDate}
                onChange={(e) => setSearchFilter({...searchFilter, travelDate: e.target.value})}
              />
            </div>
            <div className="col-md-3">
              <label className="small fw-bold mb-1 text-muted">Ngân sách (VNĐ)</label>
              <select 
                className="form-select"
                value={searchFilter.budget}
                onChange={(e) => setSearchFilter({...searchFilter, budget: e.target.value})}
              >
                <option value="">Tất cả mức giá</option>
                <option value="under5">Dưới 5 triệu</option>
                <option value="5-10">Từ 5 - 10 triệu</option>
                <option value="above10">Trên 10 triệu</option>
              </select>
            </div>
            <div className="col-md-2 d-grid pt-4">
              <button className="btn cta-btn text-white fw-bold shadow-sm" onClick={handleSearch}>
                Tìm tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WELCOME SECTION */}
      <section className="py-5 mt-5" style={{ background: "#f8fbff" }}>
        <div className="container text-center">
          <h2 className="fw-bold mb-2">Welcome to Tourify</h2>
          <p className="text-muted lead">Mang đến cho bạn những hành trình du lịch hoàn hảo nhất</p>
        </div>
      </section>

      {/* TOP RATED TOURS */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold" style={{ color: "#0b4a7a" }}>Top 5 Tour Đánh Giá Cao</h3>
            <button className="btn btn-link text-decoration-none fw-semibold" onClick={() => navigate('/tours-users')}>
              Xem tất cả →
            </button>
          </div>

          <div className="row g-4">
            {!loading ? (
              tours.map((tour, i) => (
                <div key={tour._id || i} className="col-12 col-md-6 col-lg-3">
                  <div className="card feature-card h-100 shadow-sm position-relative">
                    <div className="rating-badge">
                      ⭐ {tour.averageRating ? tour.averageRating.toFixed(1) : "5.0"}
                    </div>
                    
                    <img
                      src={
    tour.imageCover 
      ? `http://localhost:5000/img/tours/${tour.imageCover}` 
      : `https://picsum.photos/seed/${tour._id}/600/400`
  }
                      alt={tour.title}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title fw-bold" style={{ fontSize: '1rem', minHeight: '2.4rem' }}>
                        {tour.title}
                      </h5>
                      <p className="text-muted small mb-3">
                        <i className="bi bi-geo-alt me-1"></i>
                        {tour.startLocation || "Việt Nam"} • {tour.duration || "Nhiều ngày"}
                      </p>
                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold text-danger fs-5">
                            ₫{(tour.price || 0).toLocaleString()}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>Giá/khách</div>
                        </div>
                        <button 
                          className="btn btn-detail btn-sm rounded-pill px-3" 
                          onClick={() => navigate(`/tour_detail/${tour._id}`)}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /* Skeleton Loaders */
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="col-12 col-md-6 col-lg-3">
                  <div className="card feature-card h-100 shadow-sm border-0">
                    <div className="placeholder-glow">
                      <div className="placeholder col-12" style={{ height: '200px' }}></div>
                    </div>
                    <div className="card-body">
                      <h5 className="placeholder-glow">
                        <span className="placeholder col-10"></span>
                      </h5>
                      <p className="placeholder-glow">
                        <span className="placeholder col-7"></span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}