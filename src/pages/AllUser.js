import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useUser } from "../components/UserContext";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const AllUser = () => {
  const { employees, deleteEmployee } = useUser();
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 15;

  // Tính toán để lấy danh sách nhân viên cho trang hiện tại
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = employees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );

  const totalPages = Math.ceil(employees.length / employeesPerPage);

  const getRoleLabel = (role) => {
    switch (role) {
      case "manange":
        return "Lãnh đạo";
      case "monitor":
        return "Giám sát";
      case "materials":
        return "Vật tư";
      case "file":
        return "Hồ sơ";
      case "person":
        return "Nhân sự";
      default:
        return "Chưa xác định";
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa nhân viên này?"
    );
    if (confirmDelete) {
      await deleteEmployee(id);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div
        style={{ flexGrow: 1, backgroundColor: "#d1d5db", minHeight: "100vh" }}
      >
        <Header />
        <div style={{ padding: "20px" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.headerCell}>STT</th>
                <th style={styles.headerCell}>Họ và Tên</th>
                <th style={styles.headerCell}>Email</th>
                <th style={styles.headerCell}>Chức vụ</th>
                <th style={styles.headerCell}>Số điện thoại</th>
                <th style={styles.headerCell}>Điều chỉnh</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, index) => (
                <tr key={employee.id} style={styles.tableRow}>
                  <td style={styles.cell}>
                    {indexOfFirstEmployee + index + 1}
                  </td>
                  <td style={styles.cell}>{employee.fullname}</td>
                  <td style={styles.cell}>{employee.email}</td>
                  <td style={styles.cell}>{getRoleLabel(employee.role)}</td>
                  <td style={styles.cell}>{employee.phone}</td>
                  <td style={styles.cell}>
                    <Link to={`/edit-user/${employee.id}`}>
                      <FaEdit style={styles.icon} />
                    </Link>
                    &nbsp;&nbsp;
                    <FaTrashAlt
                      style={styles.icon}
                      onClick={() => handleDelete(employee.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/adduser">
            <button style={styles.addButton}>Thêm nhân viên</button>
          </Link>
          <div style={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              style={styles.pageButton}
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                style={{
                  ...styles.pageButton,
                  backgroundColor:
                    currentPage === index + 1 ? "#5961a3" : "#e3eafc",
                  color: currentPage === index + 1 ? "#fff" : "#000",
                }}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={styles.pageButton}
            >
              Tiến
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#e3eafc",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  tableHeader: {
    backgroundColor: "#5961a3",
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  headerCell: {
    padding: "10px 15px",
    borderBottom: "2px solid #ddd",
  },
  tableRow: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #ddd",
    transition: "background-color 0.3s ease",
  },
  cell: {
    padding: "10px 15px",
    textAlign: "center",
    color: "#000",
  },
  icon: {
    cursor: "pointer",
    color: "#5961a3",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    marginTop: "20px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    margin: "20px 0",
  },
  pageButton: {
    margin: "0 5px",
    padding: "5px 10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default AllUser;
