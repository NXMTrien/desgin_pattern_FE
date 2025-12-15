import React from "react";

// HomePage.jsx – VietTravel style
export default function HomePage() {
  const [tours, setTours] = React.useState([]);

  React.useEffect(() => {
    fetch("http://localhost:5000/api/tours")
      .then((res) => res.json())
      .then((data) => setTours(data.data || []))
      .catch((err) => console.error("Lỗi fetch tour:", err));
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#ffffff", padding: "10px" }}>
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

  :root {
    --brand-100: #e3f2fd;
    --brand-500: #2196f3;
    --muted: #6c757d;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
  }

  /* ===== HERO FULL SCREEN ===== */
  .hero-full {
    width: 100%;
    height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .carousel,
  .carousel-inner,
  .carousel-item {
    height: 100%;
  }

  .hero-full img {
    width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  margin-bottom: 100px;
  }

  .hero-overlay {
    position: absolute;
  inset: 0;
  background: linear-gradient(
    rgba(0, 0, 0, 0.45),
    rgba(11, 74, 122, 0.45)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  z-index: 1; 
  }

  .hero-box {
    max-width: 720px;
    padding: 20px;
    animation: fadeUp 1s ease-in-out;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(25px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ===== SEARCH CARD ===== */
  .search-card {
    m margin-top: -120px;  
  position: relative;
  z-index: 3; 
  }

  /* ===== FEATURE CARDS ===== */
  .feature-card {
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .feature-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 15px 35px rgba(0,0,0,0.08);
  }

  .feature-card img {
    height: 210px;
    object-fit: cover;
  }

  .rounded-lg {
    border-radius: 16px;
  }

  /* ===== BUTTON ===== */
  .cta-btn {
    background-color: var(--brand-500);
    border-color: var(--brand-500);
  }

  .cta-btn:hover {
    background-color: #1976d2;
    border-color: #1976d2;
  }

`}</style>

      {/* HERO FULL SCREEN */}
      <section className="hero-full position-relative">
  <div id="heroCarousel" className="carousel slide h-100" data-bs-ride="carousel" data-bs-interval="4000">
    
    {/* Indicators */}
    <div className="carousel-indicators">
      <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active"></button>
      <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
      <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
    </div>

    {/* Slides */}
    <div className="carousel-inner h-100">
      <div className="carousel-item active h-100">
        <img
          src="https://images.unsplash.com/photo-1502920917128-1aa500764b7f"
          className="d-block w-100 h-100"
          style={{ objectFit: "cover" }}
          alt="slide-1"
        />
      </div>

      <div className="carousel-item h-100">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
          className="d-block w-100 h-100"
          style={{ objectFit: "cover" }}
          alt="slide-2"
        />
      </div>

      <div className="carousel-item h-100">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
          className="d-block w-100 h-100"
          style={{ objectFit: "cover" }}
          alt="slide-3"
        />
      </div>
    </div>

    {/* Overlay Content */}
    <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100">
      <div className="h-100 d-flex align-items-center justify-content-center">
        <div className="text-center text-white px-3">
          <h1 className="fw-bold display-4">Khám phá Việt Nam cùng Tourify</h1>
          <p className="lead mt-3">
            Hành trình tuyệt vời – Trải nghiệm đẳng cấp – Giá tốt mỗi ngày
          </p>
        </div>
      </div>
    </div>

  </div>
</section>

      {/* SEARCH BOX */}
      <div className="container mb-5">
        <div className="card search-card p-4">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <input className="form-control" placeholder="Bạn muốn đi đâu?" />
            </div>
            <div className="col-md-3">
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-3">
              <select className="form-select">
                <option>2 Khách</option>
                <option>1 Khách</option>
                <option>3 Khách</option>
              </select>
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn cta-btn text-white fw-bold">Tìm tour</button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE SECTION */}
      <section className="py-5 rounded-lg" style={{ background: "#e3f2fd" }}>
        <div className="container text-center">
          <h2 className="fw-bold mb-2">Welcome to Tourify</h2>
          <p className="text-muted">Trang Home được thiết kế theo phong cách VietTravel</p>
        </div>
      </section>

      {/* TOUR LIST */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold" style={{ color: "#0b4a7a" }}>Tour nổi bật</h3>
            <a href="#" className="text-decoration-none fw-semibold">Xem tất cả →</a>
          </div>

          <div className="row g-4">
            {tours.length > 0 ? tours.map((tour, i) => (
              <div key={tour._id || i} className="col-12 col-md-6 col-lg-3">
                <div className="card feature-card h-100 rounded-lg shadow-sm">
                  <img
                    src={tour.image || `https://picsum.photos/seed/tour${i}/600/400`}
                    alt={tour.title}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{tour.title}</h5>
                    <p className="text-muted small mb-2">
                      {tour.duration || "3 ngày 2 đêm"} • {tour.location || "Khởi hành hàng ngày"}
                    </p>
                    <div className="mt-auto d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-danger">
                          ₫{(tour.price || 2500000).toLocaleString()}
                        </div>
                        <div className="text-muted small">Giá/khách</div>
                      </div>
                      <button className="btn btn-outline-primary btn-sm">Chi tiết</button>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              [1,2,3,4].map((i) => (
                <div key={i} className="col-12 col-md-6 col-lg-3">
                  <div className="card feature-card h-100 rounded-lg shadow-sm">
                    <img src={`https://picsum.photos/seed/tour${i}/600/400`} alt={`tour-${i}`} />
                    <div className="card-body">
                      <h5>Tour mẫu #{i}</h5>
                      <p className="text-muted small">3 ngày 2 đêm</p>
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
