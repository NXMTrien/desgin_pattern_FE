import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [tours, setTours] = useState([]);
  const [suggestedTours, setSuggestedTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Miền Bắc");

  const categories = ["Miền Bắc", "Miền Trung", "Miền Nam"];

  useEffect(() => {
    const fetchSuggestedTours = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/tours`);
        const data = await res.json();
        if (data.status === "success") {
          const limitedTours = (data.data.tours || []).slice(0, 8);
        setSuggestedTours(limitedTours);
        }
      } catch (err) {
        console.error("Lỗi fetch suggested tours:", err);
      }
    };

    fetchSuggestedTours();
  }, []);

  // 2. Fetch dữ liệu cho phần TOP RATED (Giữ nguyên của bạn)
  useEffect(() => {
  setLoading(true);
  fetch(`${process.env.REACT_APP_API_URL}/api/tours/top-5-rated`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("API error");
      }
      return res.json();
    })
    .then((data) => {
      if (data.status === "success") {
        setTours(data.data.tours || []);
      }
    })
    .catch((err) => console.error("Lỗi fetch top tours:", err))
    .finally(() => setLoading(false));
}, []);

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
   { id: 5, category: "Miền Bắc", name: "TUYÊN QUANG", size: "tall",
  img: "https://bbt.1cdn.vn/2023/10/09/z4766772064294_bce15ab57709c2dfb1e6d746e72219de.jpg",
  note: "Tuyên Quang là tỉnh mới được hình thành từ Hà Giang và Tuyên Quang, nổi bật với cao nguyên đá hùng vĩ, hồ sinh thái Na Hang và những cung đường đèo ngoạn mục. Vùng đất này mang vẻ đẹp nguyên sơ của núi rừng Đông Bắc, kết hợp bản sắc văn hóa độc đáo của các dân tộc vùng cao."
},

{ id: 6, category: "Miền Bắc", name: "THÁI NGUYÊN", size: "small",
  img: "https://file3.qdnd.vn/data/images/0/2023/04/22/vuhuyen/58.jpg?dpi=150&quality=100&w=870",
  note: "Thái Nguyên được sáp nhập từ Bắc Kạn và Thái Nguyên, là trung tâm kinh tế – giáo dục vùng trung du miền núi phía Bắc. Nơi đây nổi tiếng với chè Tân Cương, núi rừng xanh mát và nhiều di tích lịch sử cách mạng."
},

{ id: 7, category: "Miền Bắc", name: "PHÚ THỌ", size: "large",
  img: "https://upload.wikimedia.org/wikipedia/commons/2/21/%C4%90%C6%B0%E1%BB%9Dng_l%C3%AAn_%C4%90%E1%BB%81n_H%C3%B9ng_-_panoramio.jpg",
  note: "Phú Thọ mới được hình thành từ Vĩnh Phúc, Phú Thọ và Hòa Bình, là vùng đất cội nguồn dân tộc Việt Nam. Nổi bật với Đền Hùng linh thiêng, hồ thủy điện Hòa Bình và những thung lũng xanh mát, nơi đây kết hợp hài hòa giữa văn hóa – lịch sử – thiên nhiên."
},

{ id: 8, category: "Miền Bắc", name: "BẮC NINH", size: "small",
  img: "https://booking.muongthanh.com/upload_images/images/H%60/chua-but-thap.jpg",
  note: "Bắc Ninh được sáp nhập từ Bắc Giang và Bắc Ninh, là trung tâm công nghiệp – văn hóa lớn của miền Bắc. Đây là cái nôi của dân ca Quan họ, mang đậm nét văn hóa Kinh Bắc truyền thống xen lẫn sự phát triển hiện đại."
},

{ id: 9, category: "Miền Bắc", name: "HƯNG YÊN", size: "large",
  img: "https://cdn.tgdd.vn/Files/2023/06/01/1532455/du-lich-hung-yen-voi-x-dia-diem-hap-dan-nhat-dinh-phai-ghe-202306011130029885.jpg",
  note: "Hưng Yên mới được hợp nhất từ Hưng Yên và Thái Bình, nổi bật với vùng đồng bằng trù phú, Phố Hiến cổ kính và những làng quê Bắc Bộ yên bình. Đây là khu vực phát triển mạnh về nông nghiệp và công nghiệp nhẹ."
},

{ id: 10, category: "Miền Bắc", name: "HÀ NỘI", size: "wide",
  img: "https://res.klook.com/image/upload/q_85/c_fill,w_1360/v1719994970/cl3nrblmsvaqztfj47kh.webp",
  note: "Hà Nội là thủ đô của Việt Nam, trung tâm chính trị – văn hóa – giáo dục của cả nước. Thành phố mang vẻ đẹp giao thoa giữa lịch sử ngàn năm và nhịp sống hiện đại."
},

{ id: 11, category: "Miền Bắc", name: "HẢI PHÒNG", size: "wide",
  img: "https://cdn-media.sforum.vn/storage/app/media/ctvseo_MH/h%E1%BA%A3i%20ph%C3%B2ng%20mi%E1%BB%81n%20n%C3%A0o/hai-phong-mien-nao-1.jpg",
  note: "Hải Phòng là thành phố cảng lớn của miền Bắc, nổi tiếng với đảo Cát Bà, vịnh Lan Hạ và nền kinh tế biển phát triển năng động."
},

    // MIỀN TRUNG
    { id: 12, category: "Miền Trung", name: "THANH HÓA", size: "large",
  img: "https://bizweb.dktcdn.net/thumb/grande/100/081/807/articles/bien-sam-son-thanh-hoa.jpg?v=1541670060107",
  note: "Thanh Hóa là vùng đất giao thoa giữa Bắc và Trung Bộ, nổi bật với biển Sầm Sơn, suối cá Cẩm Lương và Thành Nhà Hồ – di sản văn hóa thế giới. Nơi đây vừa mang vẻ đẹp thiên nhiên đa dạng vừa đậm dấu ấn lịch sử lâu đời."
},

{ id: 13, category: "Miền Trung", name: "NGHỆ AN", size: "tall",
  img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSP72eLjGVNjeos-QrLizENq14g6Y5zsBecQ&s",
  note: "Nghệ An là quê hương Chủ tịch Hồ Chí Minh, nổi tiếng với biển Cửa Lò, rừng quốc gia Pù Mát và những làng quê xứ Nghệ mộc mạc."
},

{ id: 14, category: "Miền Trung", name: "HÀ TĨNH", size: "small",
  img: "https://vcdn1-dulich.vnecdn.net/2024/05/07/ho-ke-go-9057-1715072242.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=WXOPMqw603bXPxu84dKFmQ",
  note: "Hà Tĩnh gây ấn tượng với biển Thiên Cầm hoang sơ, núi Hồng Lĩnh hùng vĩ và những giá trị văn hóa dân gian đặc sắc."
},

{ id: 15, category: "Miền Trung", name: "QUẢNG TRỊ", size: "small",
  img: "https://cdn.tgdd.vn/Files/2021/07/03/1365421/10-dia-diem-du-lich-quang-tri-dang-di-nhat-202308181537507901.jpg",
  note: "Quảng Trị là vùng đất lịch sử gắn liền với cầu Hiền Lương – sông Bến Hải và địa đạo Vịnh Mốc."
},

{ id: 16, category: "Miền Trung", name: "HUẾ", size: "wide",
  img: "https://images.vietnamtourism.gov.vn/vn//images/2022/thang_6/1206.thuathienhue2.jpg",
  note: "Cố đô Huế mang vẻ đẹp cung đình cổ kính với Đại Nội, lăng tẩm triều Nguyễn và sông Hương thơ mộng."
},

{ id: 17, category: "Miền Trung", name: "ĐÀ NẴNG", size: "wide",
  img: "https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA",
  note: "Đà Nẵng là thành phố đáng sống với biển Mỹ Khê, Bà Nà Hills và Cầu Vàng nổi tiếng thế giới."
},

{ id: 18, category: "Miền Trung", name: "QUẢNG NGÃI", size: "large",
  img: "https://static.vinwonders.com/production/diem-du-lich-quang-ngai-1.jpg",
  note: "Quảng Ngãi nổi bật với đảo Lý Sơn hoang sơ và cảnh quan núi lửa độc đáo."
},

{ id: 19, category: "Miền Trung", name: "KHÁNH HÒA", size: "large",
  img: "https://letsflytravel.vn/wp-content/uploads/2024/08/nha-trang-2.webp",
  note: "Khánh Hòa nổi tiếng với thành phố biển Nha Trang và những vịnh biển đẹp hàng đầu thế giới."
},

{ id: 20, category: "Miền Trung", name: "GIA LAI", size: "tall",
  img: "https://vcdn1-dulich.vnecdn.net/2023/10/25/thongT-1698224695-2101-1698229160.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=4sJEM8_IgVci5anUyJceSA",
  note: "Gia Lai mang vẻ đẹp hoang sơ của Tây Nguyên với Biển Hồ, rừng thông và văn hóa cồng chiêng."
},

{ id: 21, category: "Miền Trung", name: "ĐẮK LẮK", size: "tall",
  img: "https://vcdn1-dulich.vnecdn.net/2022/04/20/thacDakLak02-1650454521-7409-1650455161.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=6vZa8c69p_IJvwjcOJE3hg",
  note: "Đắk Lắk là thủ phủ cà phê Việt Nam, nổi bật với Buôn Đôn và thác Dray Nur hùng vĩ."
},

{ id: 22, category: "Miền Trung", name: "LÂM ĐỒNG", size: "large",
  img: "https://samtenhills.vn/wp-content/uploads/2024/01/thac-pongour-voi-quang-canh-tuyet-dep.jpg",
  note: "Lâm Đồng nổi tiếng với Đà Lạt mộng mơ, khí hậu mát mẻ và cảnh sắc thiên nhiên lãng mạn."
},

    // MIỀN NAM
   {
  id: 23,
  category: "Miền Nam",
  name: "TP. HỒ CHÍ MINH",
  size: "large",
  img: "https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2017/07/5214486810_49ccd5c42f_z-1.jpg",
  note: "TP. Hồ Chí Minh là trung tâm kinh tế sôi động với nhịp sống hiện đại, các công trình lịch sử nổi bật và nền ẩm thực đường phố phong phú. Thành phố không ngủ mang đến trải nghiệm năng động cả ngày lẫn đêm."
},
{
  id: 24,
  category: "Miền Nam",
  name: "ĐỒNG NAI",
  size: "wide",
  img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfhQyc4X2Q8MhzkXXO0_HDJ4jzIVD1uVMHGw&s",
  note: "Đồng Nai nổi bật với du lịch sinh thái như Vườn quốc gia Cát Tiên, hồ Trị An và các thác nước xanh mát, thích hợp cho nghỉ dưỡng cuối tuần."
},
{
  id: 25,
  category: "Miền Nam",
  name: "TÂY NINH",
  size: "large",
  img: "https://mia.vn/media/uploads/blog-du-lich/du-lich-tay-ninh-12-1753671798.jpg",
  note: "Tây Ninh gắn liền với núi Bà Đen – biểu tượng tâm linh và du lịch nổi bật của Nam Bộ, mang đến trải nghiệm chinh phục và không gian thanh tịnh."
},
{
  id: 26,
  category: "Miền Nam",
  name: "CẦN THƠ",
  size: "wide",
  img: "https://tinviettravel.com.vn/uploads/cam-nang-du-lich/2025_01/cho-noi-cai-rang.jpg",
  note: "Cần Thơ là trung tâm miền Tây sông nước, nổi tiếng với chợ nổi Cái Răng, bến Ninh Kiều và nét văn hóa miệt vườn hiền hòa."
},
{
  id: 27,
  category: "Miền Nam",
  name: "VĨNH LONG",
  size: "large",
  img: "https://cdn.tgdd.vn/Files/2021/07/03/1365427/23-dia-diem-du-lich-vinh-long-hap-dan-khach-du-lich-202201071810564126.jpg",
  note: "Vĩnh Long mang vẻ đẹp yên bình với cù lao, vườn trái cây trĩu quả và không gian đậm chất miền Tây sông nước."
},
{
  id: 28,
  category: "Miền Nam",
  name: "ĐỒNG THÁP",
  size: "wide",
  img: "https://vcdn1-dulich.vnecdn.net/2023/12/10/senT-jpeg-4319-1702147840.jpg?w=0&h=0&q=100&dpr=1&fit=crop&s=s7Ghwis70BJ0AqOBL4AipA",
  note: "Đồng Tháp nổi tiếng với cánh đồng sen và Vườn quốc gia Tràm Chim, mang vẻ đẹp thiên nhiên thuần khiết và yên tĩnh."
},
{
  id: 29,
  category: "Miền Nam",
  name: "CÀ MAU",
  size: "wide",
  img: "https://media.vietravel.com/images/Content/dia-diem-du-lich-ca-mau-1.jpg",
  note: "Cà Mau là điểm cực Nam Tổ quốc với rừng ngập mặn, Đất Mũi thiêng liêng và nét đẹp hoang sơ đặc trưng."
},
{
  id: 30,
  category: "Miền Nam",
  name: "AN GIANG",
  size: "large",
  img: "https://cdn.vntrip.vn/cam-nang/wp-content/uploads/2018/02/nui-cam-an-giang-1.png",
  note: "An Giang nổi bật với Núi Cấm, rừng tràm Trà Sư và sự giao thoa văn hóa đặc sắc của các dân tộc vùng biên."
},
{
  id: 31,
  category: "Miền Nam",
  name: "PHÚ QUỐC",
  size: "large",
  img: "https://rootytrip.com/wp-content/uploads/2024/07/phu-quoc.jpg",
  note: "Phú Quốc là thiên đường biển đảo với bãi biển trong xanh, resort cao cấp và các hoạt động nghỉ dưỡng đẳng cấp quốc tế."
}

    ];

  const [searchFilter, setSearchFilter] = useState({
    destination: "",
    travelDate: "",
    budget: "",
  });

  // useEffect(() => {
  //   setLoading(true);
  //   fetch(`${process.env.REACT_APP_API_URL}/api/tours/top-5-rated`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.status === "success") {
  //         setTours(data.data.tours || []);
  //       }
  //     })
  //     .catch((err) => console.error("Lỗi fetch top tours:", err))
  //     .finally(() => setLoading(false));
  // }, []);

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
        @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css');

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
/* Flip Card Styling */
        .flip-card {
          background-color: transparent;
          height: 380px;
          perspective: 1000px;
          cursor: pointer;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: left;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          border-radius: 15px;
        }

        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }

        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          border-radius: 15px;
          overflow: hidden;
        }

        .flip-card-front {
          background-color: #ffffff;
          color: #333;
          padding: 20px;
          display: flex;
          flex-direction: column;
          border: 1px solid #eee;
        }

        .flip-card-back {
          background-color: var(--dark-blue);
          transform: rotateY(180deg);
        }

        .flip-card-back img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info-row {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          font-size: 0.9rem;
          color: #555;
        }

        .info-row i {
          width: 25px;
          color: var(--brand-500);
          font-size: 1.1rem;
          margin-right: 8px;
        }

        .price-label {
          margin-top: auto;
          text-align: right;
        }
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
                      src={tour.imageCover ? `${process.env.REACT_APP_API_URL}/img/tours/${tour.imageCover}` : `https://picsum.photos/seed/${i}/600/400`}
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
      {/* SECTION GỢI Ý CHUYẾN ĐI (FLIP CARDS) */}
      {/* GỢI Ý CHUYẾN ĐI (DỮ LIỆU TỪ DATABASE) */}
      <section className="py-5 mt-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-uppercase" style={{ color: "#0b4a7a" }}>Gợi Ý Chuyến Đi</h2>
            <div className="mx-auto" style={{ width: "60px", height: "3px", backgroundColor: "#2196f3" }}></div>
          </div>

          <div className="row g-4">
            {suggestedTours.length > 0 ? (
              suggestedTours.map((tour) => (
                <div key={tour._id} className="col-12 col-md-6 col-lg-3">
                  <div className="flip-card">
                    <div className="flip-card-inner">
                      {/* MẶT TRƯỚC: Lấy từ Database */}
                      <div className="flip-card-front">
                        <small className="text-muted fw-bold mb-1">CHUYẾN ĐI MỚI NHẤT</small>
                        <h6 className="fw-bold text-primary mb-3" style={{ height: '40px', overflow: 'hidden' }}>{tour.title}</h6>
                        
                        <div className="info-row">
                          <i className="bi bi-qr-code"></i>
                          <span><strong>Mã:</strong> {tour._id?.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="info-row">
                          <i className="bi bi-geo-alt"></i>
                          <span><strong>Điểm đến:</strong> {tour.destination || "Việt Nam"}</span>
                        </div>
                        <div className="info-row">
                          <i className="bi bi-clock"></i>
                          <span><strong>Thời lượng:</strong> {tour.duration} ngày</span>
                        </div>
                        <div className="info-row">
                          <i className="bi bi-people"></i>
                          <span><strong>Số chỗ:</strong> {tour.maxGroupSize} người</span>
                        </div>

                        <div className="mt-auto text-end">
                          <small className="text-muted">Giá từ</small>
                          <h5 className="text-danger fw-bold mb-0">{tour.price?.toLocaleString()} ₫</h5>
                        </div>
                      </div>

                      {/* MẶT SAU: Hình ảnh từ Database */}
                      <div className="flip-card-back">
                        <img 
                          src={tour.imageCover ? `${process.env.REACT_APP_API_URL}/img/tours/${tour.imageCover}` : "https://picsum.photos/400/600"} 
                          alt={tour.title} 
                        />
                        <div className="position-absolute top-50 start-50 translate-middle w-100 text-center">
                          <button 
                            className="btn btn-light btn-sm rounded-pill fw-bold shadow"
                            onClick={() => navigate(`/tour_detail/${tour._id}`)}
                          >
                            XEM CHI TIẾT
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Đang tải gợi ý...</p>
            )}
          </div>
        </div>
      </section>
      
    </div>
  );
}