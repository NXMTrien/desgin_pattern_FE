// src/components/CategoryForm.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function CategoryForm() {
  const [name, setName] = useState("");              // tên category
  const [description, setDescription] = useState(""); // mô tả
  const [categories, setCategories] = useState([]);  // danh sách category
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy danh sách category khi load trang
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
  try {
    const token = localStorage.getItem("token"); // lấy token đã login
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setCategories(res.data.data.categories || []);
  } catch (err) {
    console.error("Lỗi khi load categories:", err);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  try {
    const token = localStorage.getItem("token"); // lấy token đã login
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/tours/categories`,
      { name, description },
      {
        headers: {
          Authorization: `Bearer ${token}`, // gửi token lên backend
        },
      }
    );

    if (res.status === 201) {
      setSuccess("Tạo danh mục thành công!");
      setName("");
      setDescription("");
      fetchCategories(); // refresh danh sách
    }
  } catch (err) {
    console.error("Error:", err);
    setError("Không thể tạo danh mục. Có thể tên đã tồn tại hoặc bạn không có quyền!");
  }
};


  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="mb-4 text-center">Quản lý Danh mục</h2>

      {/* Form tạo category */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Tên danh mục</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên danh mục"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả (tùy chọn)"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-success w-100">
          Tạo Danh mục
        </button>
      </form>

      {/* Danh sách category */}
     <h3 className="mt-5">Danh sách danh mục</h3>
<table className="table table-bordered table-striped mt-3">
  <thead className="table-dark">
    <tr>
      <th scope="col">STT</th>
      <th scope="col">Danh mục tour</th>
      <th scope="col">Mô tả tour</th>
    </tr>
  </thead>
  <tbody>
    {categories.length > 0 ? (
      categories.map((cat, index) => (
        <tr key={cat._id}>
          <td>{index + 1}</td>
          <td>{cat.name}</td>
          <td>{cat.description || "Không có mô tả"}</td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="3" className="text-center">
          Chưa có danh mục nào
        </td>
      </tr>
    )}
  </tbody>
</table>

    </div>
  );
}

export default CategoryForm;
