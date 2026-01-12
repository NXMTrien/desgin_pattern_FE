import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Miền Bắc");

  const categories = ["Miền Bắc", "Miền Trung", "Miền Nam"];

  // Dữ liệu đã tối ưu size để Grid luôn khít
  const allDestinations = [
    // MIỀN BẮC
    { id: 1, category: "Miền Bắc", name: "QUẢNG NINH", size: "large", img: "https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcQveNxLFaE11iRrRHfD9mO9B_PifshaabhPWoVVOGTBkrrqASgYwfYmDqNtYMN_LMkcErVHViURfvPhVti9Tn8Xj0o&s=19", 
      note: "Quảng Ninh nổi tiếng với Vịnh Hạ Long, di sản thiên nhiên thế giới sở hữu hàng ngàn đảo đá vôi kỳ vĩ. Du khách có thể trải nghiệm nghỉ đêm trên du thuyền sang trọng, chèo thuyền kayak qua những hang động huyền bí như Hang Sửng Sốt hay Động Thiên Cung. Bên cạnh đó, vùng đất này còn có đảo Cô Tô xanh trong và quần thể tâm linh Yên Tử cổ kính. Với hạ tầng hiện đại và dịch vụ đẳng cấp, Quảng Ninh là điểm đến lý tưởng cho cả nghỉ dưỡng và khám phá." },
    { id: 2, category: "Miền Bắc", name: "HÀ GIANG", size: "tall", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm6tortIB6hmJ_Xfpdz8thHYXgxEREjlkx1w&s", 
      note: "Hà Giang chinh phục du khách bởi vẻ đẹp hùng vĩ của Cao nguyên đá Đồng Văn và những cung đường đèo hiểm trở như Mã Pí Lèng. Dòng sông Nho Quế xanh ngắt uốn lượn dưới chân núi tạo nên bức tranh thiên nhiên tuyệt mỹ. Mỗi mùa hoa tam giác mạch về, Hà Giang lại khoác lên mình sắc tím mộng mơ. Đây là nơi lý tưởng để tìm hiểu văn hóa đặc sắc của các dân tộc vùng cao và tận hưởng không khí trong lành, hoang sơ của địa đầu Tổ quốc." },
    { id: 3, category: "Miền Bắc", name: "LÀO CAI", size: "small", img: "https://cdn.tgdd.vn/Files/2021/07/03/1365444/kham-pha-13-dia-diem-du-lich-lao-cai-dep-noi-tieng-202303281656546137.jpg", 
      note: "Lào Cai sở hữu thị trấn Sapa mờ sương với đỉnh Fansipan - nóc nhà Đông Dương huyền thoại. Những thửa ruộng bậc thang tại thung lũng Mường Hoa đã trở thành biểu tượng du lịch vùng cao với vẻ đẹp rực rỡ mùa lúa chín. Du khách đến đây không chỉ để chinh phục thiên nhiên mà còn để trải nghiệm bản sắc văn hóa độc đáo của người H'Mông, người Dao tại các bản làng. Sapa luôn mang lại cảm giác bình yên, lãng mạn và sự thư thái tuyệt vời." },
    { id: 4, category: "Miền Bắc", name: "NINH BÌNH", size: "small", img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/%E1%BA%A3nh%20%C4%91%E1%BA%B9p%20ninh%20b%C3%ACnh/anh-dep-ninh-binh-3.jpg", 
      note: "Ninh Bình được ví như 'Hạ Long trên cạn' với quần thể danh thắng Tràng An và Tam Cốc rực rỡ. Ngồi trên thuyền nhỏ lướt trên dòng sông Ngô Đồng, du khách sẽ được chiêm ngưỡng những dãy núi đá vôi sừng sững và những hang động kỳ ảo. Ngoài ra, Cố đô Hoa Lư và chùa Bái Đính còn mang lại những giá trị lịch sử, tâm linh sâu sắc. Ninh Bình là sự kết hợp hoàn hảo giữa vẻ đẹp thiên nhiên yên bình và những dấu ấn văn hóa nghìn năm." },
    // { id: 5, category: "Miền Bắc", name: "YÊN BÁI", size: "small", img: "https://nads.1cdn.vn/2024/07/12/yby1.jpg", 
    //   note: "Yên Bái nổi tiếng với Mù Cang Chải, nơi có những thửa ruộng bậc thang kỳ vĩ nhất Việt Nam. Mỗi mùa lúa chín, cả vùng đồi núi nhuộm một màu vàng óng ả, thu hút hàng ngàn nhiếp ảnh gia và những người yêu thiên nhiên. Đèo Khau Phạ với những làn mây bồng bềnh là địa điểm lý tưởng cho những ai thích chinh phục. Yên Bái còn có hồ Thác Bà xanh mát và những đồi chè cổ thụ Suối Giàng hàng trăm năm tuổi, tạo nên một hành trình khám phá đầy màu sắc." },

    // MIỀN TRUNG
    { id: 6, category: "Miền Trung", name: "ĐÀ NẴNG", size: "large", img: "https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA", 
      note: "Đà Nẵng là thành phố đáng sống nhất Việt Nam với sự kết hợp hài hòa giữa biển Mỹ Khê quyến rũ và núi Bà Nà mây phủ. Biểu tượng Cầu Vàng được nâng đỡ bởi đôi bàn tay khổng lồ đã trở thành điểm đến thu hút du khách toàn thế giới. Thành phố còn nổi tiếng với những cây cầu hiện đại, bán đảo Sơn Trà hoang sơ và Ngũ Hành Sơn kỳ bí. Với dịch vụ chuyên nghiệp và con người thân thiện, Đà Nẵng luôn mang lại những trải nghiệm du lịch hiện đại và đẳng cấp." },
    { id: 7, category: "Miền Trung", name: "HỘI AN", size: "tall", img: "https://images.vietnamtourism.gov.vn/vn/images/2023/thang_6/11125-quang_nam-huybank%40gmail.com-hoi_an_ve_dem_-1.jpg", 
      note: "Phố cổ Hội An mang vẻ đẹp hoài cổ với những ngôi nhà tường vàng rêu phong và ánh đèn lồng rực rỡ về đêm. Dòng sông Hoài thơ mộng là nơi du khách có thể thả hoa đăng cầu may mắn. Hội An không chỉ có kiến trúc độc đáo mà còn có nền ẩm thực tinh tế với Cao Lầu, cơm gà nổi tiếng. Sự bình lặng, chậm rãi của nhịp sống nơi đây giúp du khách quên đi những lo toan hối hả của đời thường, tìm lại sự an yên trong tâm hồn." },
    { id: 8, category: "Miền Trung", name: "HUẾ", size: "small", img: "https://images.vietnamtourism.gov.vn/vn//images/2022/thang_6/1206.thuathienhue2.jpg", 
      note: "Cố đô Huế là biểu tượng của vẻ đẹp cung đình và nét thanh lịch cổ kính. Đại Nội Huế cùng hệ thống lăng tẩm triều Nguyễn dọc sông Hương tạo nên một không gian lịch sử trầm mặc. Nghe ca Huế trên thuyền rồng và thưởng thức ẩm thực cung đình là những trải nghiệm khó quên. Huế mang trong mình sự dịu dàng và tinh tế, là điểm đến không thể bỏ qua cho những ai yêu thích tìm hiểu về văn hóa, lịch sử dân tộc." },
    { id: 9, category: "Miền Trung", name: "NHA TRANG", size: "small", img: "https://letsflytravel.vn/wp-content/uploads/2024/08/nha-trang-2.webp", 
      note: "Nha Trang sở hữu một trong những vịnh biển đẹp nhất thế giới với làn nước trong xanh và bãi cát trắng mịn màng. Đây là thiên đường cho các môn thể thao nước như lặn ngắm san hô tại Hòn Mun hay tham gia các trò chơi cảm giác mạnh tại VinWonders. Tháp Bà Ponagar cổ kính cũng là một điểm dừng chân mang đậm giá trị văn hóa Chăm Pa. Nha Trang hội tụ đủ các yếu tố từ thiên nhiên biển đảo đến dịch vụ nghỉ dưỡng cao cấp." },

    // MIỀN NAM
    { id: 10, category: "Miền Nam", name: "ĐÀ LẠT", size: "large", img: "https://static.vinwonders.com/production/ho-xuan-huong-da-lat-1.jpg", 
      note: "Đà Lạt là thành phố ngàn hoa với khí hậu cao nguyên mát mẻ quanh năm và những rừng thông xanh ngát. Những địa danh như Hồ Xuân Hương, thung lũng Tình Yêu hay Dinh Bảo Đại mang lại vẻ đẹp lãng mạn, mộng mơ đặc trưng. Đà Lạt còn thu hút bởi những quán cà phê 'chill' và các vườn hoa rực rỡ sắc màu. Đây là điểm đến lý tưởng cho những chuyến nghỉ dưỡng, giúp bạn tận hưởng bầu không khí trong lành và cảnh sắc thiên nhiên dịu dàng." },
    { id: 11, category: "Miền Nam", name: "PHÚ QUỐC", size: "wide", img: "https://rootytrip.com/wp-content/uploads/2024/07/phu-quoc.jpg", 
      note: "Phú Quốc - Đảo Ngọc với những bãi biển hoang sơ như Bãi Sao, Bãi Trường luôn làm say lòng du khách. Đảo sở hữu các khu nghỉ dưỡng 5 sao quốc tế cùng những hoạt động giải trí quy mô như Grand World và Vinpearl Safari. Ngắm hoàng hôn tại Dinh Cậu hay thưởng thức hải sản tươi ngon tại chợ đêm là những trải nghiệm tuyệt vời. Phú Quốc không chỉ là thiên đường biển đảo mà còn là nơi nghỉ dưỡng sang trọng bậc nhất hiện nay." },
    { id: 12, category: "Miền Nam", name: "CẦN THƠ", size: "wide", img: "https://tinviettravel.com.vn/uploads/cam-nang-du-lich/2025_01/cho-noi-cai-rang.jpg", 
      note: "Cần Thơ là trái tim của miền Tây sông nước với chợ nổi Cái Răng nhộn nhịp mỗi sáng sớm. Du khách có thể trải nghiệm ngồi lênh đênh trên thuyền, thưởng thức hủ tiếu và trái cây tươi ngay tại chợ. Bến Ninh Kiều và những vườn trái cây trĩu quả mang lại nét đẹp bình dị, trù phú của vùng đồng bằng sông Cửu Long. Sự chân thành, hiếu khách của người dân Tây Đô cùng nét văn hóa sông nước độc đáo là điều khiến du khách luôn nhớ về." }
  ];

  const [searchFilter, setSearchFilter] = useState({
    destination: "",
    travelDate: "",
    budget: "",
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
    const queryParams = new URLSearchParams({
      destination: searchFilter.destination,
      travelDate: searchFilter.travelDate,
      budget: searchFilter.budget,
    }).toString();
    navigate(`/tours-users?${queryParams}`);
  };

  const filteredDestinations = useMemo(() => {
    return allDestinations.filter(dest => dest.category === activeTab);
  }, [activeTab]);

  const handleCardClick = (destName) => {
    const query = new URLSearchParams({ destination: destName }).toString();
    navigate(`/tours-users?${query}`);
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

        body { margin: 0; padding: 0; overflow-x: hidden; }

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

        .hero-full img { width: 100vw; height: 100%; object-fit: cover; }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(0,0,0,0.3), rgba(11, 74, 122, 0.4));
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-card {
          margin-top: -60px;
          position: relative;
          z-index: 10;
          border-radius: 16px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          border: none;
          background: white;
        }

        .feature-card { border-radius: 16px; overflow: hidden; transition: all 0.3s ease; border: none; }
        .feature-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }

        .rating-badge {
          position: absolute; top: 15px; right: 15px;
          background: rgba(255, 255, 255, 0.95);
          padding: 4px 10px; border-radius: 20px;
          font-weight: 700; color: #ff9800; z-index: 5;
        }

        .cta-btn { background-color: var(--brand-500); border: none; padding: 12px; }
        .cta-btn:hover { background-color: var(--brand-700); }

        /* Grid System */
        .destination-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 250px;
          gap: 15px;
        }

        .dest-item {
          position: relative; border-radius: 12px; overflow: hidden; cursor: pointer;
        }

        .dest-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .large { grid-column: span 2; grid-row: span 2; }
        .tall { grid-row: span 2; }
        .wide { grid-column: span 2; }

        .dest-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(11, 74, 122, 0.95) 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 20px; transition: all 0.4s ease;
        }

        .dest-item:hover .dest-overlay { background: rgba(11, 74, 122, 0.85); }
        .dest-item:hover img { transform: scale(1.1); }

        .dest-note-wrapper { max-height: 0; opacity: 0; overflow: hidden; transition: all 0.4s ease; }
        .dest-item:hover .dest-note-wrapper { max-height: 160px; opacity: 1; }

        .dest-note {
          font-size: 0.82rem; color: #f0f0f0; line-height: 1.5;
          margin-top: 10px; text-align: justify;
          overflow-y: auto; max-height: 140px; padding-right: 5px;
        }

        .dest-note::-webkit-scrollbar { width: 3px; }
        .dest-note::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); }

        @media (max-width: 992px) {
          .destination-grid { grid-template-columns: repeat(2, 1fr); }
          .large, .wide, .tall { grid-column: span 1; grid-row: span 1; }
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
              <img src="https://static.vinwonders.com/production/ho-xuan-huong-da-lat-1.jpg" alt="Đà Lạt" />
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
              <label className="small fw-bold mb-1 text-muted">Ngân sách</label>
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

      {/* TOP RATED TOURS */}
      <section className="py-5 mt-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold" style={{ color: "#0b4a7a" }}>Top Đánh Giá Cao</h3>
            <button className="btn btn-link text-decoration-none fw-semibold" onClick={() => navigate('/tours-users')}>
              Xem tất cả →
            </button>
          </div>

          <div className="row g-4">
            {!loading ? (
              tours.map((tour, i) => (
                <div key={tour._id || i} className="col-12 col-md-6 col-lg-3">
                  <div className="card feature-card h-100 shadow-sm position-relative">
                    <div className="rating-badge">⭐ {tour.averageRating?.toFixed(1) || "5.0"}</div>
                    <img
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                      src={tour.imageCover ? `http://localhost:5000/img/tours/${tour.imageCover}` : `https://picsum.photos/seed/${i}/600/400`}
                      alt={tour.title}
                    />
                    <div className="card-body d-flex flex-column">
                      <h6 className="fw-bold mb-2">{tour.title}</h6>
                      <div className="mt-auto">
                        <div className="fw-bold text-danger">₫{tour.price?.toLocaleString()}</div>
                        <button className="btn btn-outline-primary btn-sm w-100 mt-2 rounded-pill" onClick={() => navigate(`/tour_detail/${tour._id}`)}>Chi tiết</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map(i => <div key={i} className="col-lg-3 placeholder-glow"><div className="placeholder col-12" style={{height:'250px'}}></div></div>)
            )}
          </div>
        </div>
      </section>

      {/* DESTINATION SECTION */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-uppercase" style={{ color: "#0b4a7a" }}>Điểm Đến Yêu Thích</h2>
            <div className="mx-auto" style={{ width: "60px", height: "3px", backgroundColor: "#2196f3" }}></div>
          </div>

          <div className="d-flex justify-content-center mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`btn mx-2 fw-bold ${activeTab === cat ? "btn-primary" : "btn-outline-secondary"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="destination-grid">
            {filteredDestinations.map((dest) => (
              <div key={dest.id} className={`dest-item ${dest.size}`} onClick={() => handleCardClick(dest.name)}>
                <img src={dest.img} alt={dest.name} loading="lazy" />
                <div className="dest-overlay">
                  <div className="dest-content">
                    <h4 className="fw-bold text-white mb-1">{dest.name}</h4>
                    <div className="dest-note-wrapper">
                      <p className="dest-note">{dest.note}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}