// src/pages/AddUser.js
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useUser } from "../components/UserContext"; // Hàm tạo tài khoản
import "../styles/AddUser.css";

const roleOptions = [
  { value: "manange", label: "Lãnh đạo" },
  { value: "monitor", label: "Giám sát" },
  { value: "materials", label: "Vật tư" },
  { value: "file", label: "Hồ sơ" },
  { value: "person", label: "Nhân sự" },
  { value: "accountant", label: "Kế toán" },
  // Thêm các vai trò khác nếu cần
];

const AddUser = () => {
  const { addEmployee } = useUser();
  const [newEmployee, setNewEmployee] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await addEmployee(newEmployee);
      setSuccessMessage("Nhân viên đã được tạo tài khoản thành công!");
      setNewEmployee({
        fullname: "",
        email: "",
        password: "",
        phone: "",
        role: "",
      });
    } catch (error) {
      setError("Có lỗi xảy ra khi tạo tài khoản hoặc lưu thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flexGrow: 1, backgroundColor: "#d1d5db" }}>
        <Header />
        <div className="form-container">
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-group">
              <label>Tên nhân viên:</label>
              <input
                type="text"
                name="fullname"
                value={newEmployee.fullname}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={newEmployee.email}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu:</label>
              <input
                type="password"
                name="password"
                value={newEmployee.password}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="text"
                name="phone"
                value={newEmployee.phone}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Chức vụ:</label>
              <select
                name="role"
                value={newEmployee.role}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="">Chọn chức vụ</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Tạo tài khoản nhân viên"}
            </button>
          </form>
          {error && <p className="error-message">{error}</p>}
          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddUser;
