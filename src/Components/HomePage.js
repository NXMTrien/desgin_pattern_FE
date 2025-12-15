import React, { useState }from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [tours, setTours] = React.useState([]);
  const navigate = useNavigate();

const [searchFilter, setSearchFilter] = useState({
    destination: "",
    travelDate: "",
    budget: "",
  });


  React.useEffect(() => {
    fetch("http://localhost:5000/api/tours")
      .then((res) => res.json())
      .then((data) => setTours(data.data || []))
      .catch((err) => console.error("Lỗi fetch tour:", err));
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      destination: searchFilter.destination,
      travelDate: searchFilter.travelDate,
      guests: searchFilter.guests
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
          --muted: #6c757d;
        }

        /* RESET BODY ĐỂ CHẠM MÉP MÀN HÌNH */
        body {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden; 
        }

        /* HERO FULL WIDTH */
        .hero-full {
  width: 100vw;               /* Ép rộng bằng đúng chiều ngang màn hình */
  position: relative;
  left: 50%;                  /* Đưa sang giữa */
  right: 50%;
  margin-left: -50vw;         /* Kéo ngược lại để sát lề trái */
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
  object-fit: cover;          /* Giúp ảnh không bị méo */
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

        /* SEARCH BOX NẰM ĐÈ LÊN BANNER */
        .search-card {
          margin-top: -50px; /* Đẩy thẻ tìm kiếm lên trên banner */
          position: relative;
          z-index: 10;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          border: none;
          background: white;
        }

        .feature-card {
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          border: none;
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }

        .feature-card img {
          height: 200px;
          object-fit: cover;
        }

        .cta-btn {
          background-color: var(--brand-500);
          border-color: var(--brand-500);
          padding: 12px;
        }

        .cta-btn:hover {
          background-color: #1976d2;
          border-color: #1976d2;
        }
      `}</style>

      {/* HERO SECTION - FULL WIDTH */}
      <section className="hero-full">
  <div 
    id="heroCarousel" 
    className="carousel slide carousel-fade" 
    data-bs-ride="carousel" 
    data-bs-interval="3000"  
  >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA"
                alt="slide-1"
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://samtenhills.vn/wp-content/uploads/2024/01/khong-gian-tinh-lang-va-ve-dep-nen-tho-cua-ho-tuyen-lam.jpg"
                alt="slide-2"
              />
            </div>
            <div className="carousel-item">
              <img
                src="https://samtenhills.vn/wp-content/uploads/2024/01/trai-nghiem-du-day-vuot-thac-tai-khu-du-lich-thac-datanla.jpeg"
                alt="slide-3"
              />
            </div>
          </div>

          <div className="hero-overlay">
            <div className="text-center text-white px-3">
              <h1 className="fw-bold display-4">Khám phá Việt Nam cùng Tourify</h1>
              <p className="lead mt-3 fs-4">
                Hành trình tuyệt vời – Trải nghiệm đẳng cấp – Giá tốt mỗi ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BOX - Bọc trong container để giữ lề nội dung */}
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
    /* Đổi từ searchFilter.guests sang searchFilter.budget */
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
              <button 
                className="btn cta-btn text-white fw-bold shadow-sm"
                onClick={handleSearch}
              >
                Tìm tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE SECTION */}
      <section className="py-5 my-5" style={{ background: "#f8fbff" }}>
        <div className="container text-center">
          <h2 className="fw-bold mb-2">Welcome to Tourify</h2>
          <p className="text-muted lead">Mang đến cho bạn những hành trình du lịch hoàn hảo nhất</p>
        </div>
      </section>

      {/* TOUR LIST */}
      <section className="pb-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold" style={{ color: "#0b4a7a" }}>Tour nổi bật</h3>
            <a href="#" className="text-decoration-none fw-semibold">Xem tất cả →</a>
          </div>

          <div className="row g-4">
            {tours.length > 0 ? tours.map((tour, i) => (
              <div key={tour._id || i} className="col-12 col-md-6 col-lg-3">
                <div className="card feature-card h-100 shadow-sm">
                  <img
                    src={tour.image || `https://picsum.photos/seed/tour${i}/600/400`}
                    alt={tour.title}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold" style={{ fontSize: '1.1rem' }}>{tour.title}</h5>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-clock me-1"></i>{tour.duration || "3 ngày 2 đêm"} • {tour.location || "Vũng Tàu"}
                    </p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-danger fs-5">
                          ₫{(tour.price || 2500000).toLocaleString()}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Giá/khách</div>
                      </div>
                      <button className="btn btn-outline-primary btn-sm rounded-pill px-3">Chi tiết</button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              /* Skeleton Loader khi chưa có data */
              [1,2,3,4].map((i) => (
                <div key={i} className="col-12 col-md-6 col-lg-3">
                  <div className="card feature-card h-100 shadow-sm border-0">
                    <div style={{ height: '200px', backgroundColor: '#eee' }}></div>
                    <div className="card-body">
                      <div style={{ height: '20px', width: '80%', backgroundColor: '#eee', marginBottom: '10px' }}></div>
                      <div style={{ height: '15px', width: '50%', backgroundColor: '#eee' }}></div>
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