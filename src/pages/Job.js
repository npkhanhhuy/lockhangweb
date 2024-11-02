import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { useJobs } from "../components/JobContext";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const Job = () => {
  const { projects, deleteJob, loading, error } = useJobs();

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 15;

  // Tính toán vị trí bắt đầu và kết thúc của các dự án trên trang hiện tại
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const calculateDuration = (datestart, dateend) => {
    const startDate = new Date(datestart.split("-").reverse().join("-"));
    const endDate = new Date(dateend.split("-").reverse().join("-"));
    const timeDiff = endDate - startDate;
    const dayDiff = timeDiff / (1000 * 3600 * 24);
    return dayDiff;
  };

  const calculateDurations = (datestart, dateend) => {
    const startDate = new Date(datestart.split("-").reverse().join("-"));
    const endDate = new Date(dateend.split("-").reverse().join("-"));
    const timeDiff = endDate - startDate;
    const monthDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 30.44));
    return monthDiff;
  };

  // Hàm để chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div
        style={{ flexGrow: 1, backgroundColor: "#d1d5db", minHeight: "100vh" }}
      >
        <Header />
        <div style={{ padding: "20px" }}>
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.headerCell}>STT</th>
                    <th style={styles.headerCell}>Dự án</th>
                    <th style={styles.headerCell}>Giám sát</th>
                    <th style={styles.headerCell}>Hồ sơ</th>
                    <th style={styles.headerCell}>Thời hạn</th>
                    <th style={styles.headerCell}>Khối lượng</th>
                    <th style={styles.headerCell}>Điều chỉnh</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project, index) => (
                    <tr key={project.id} style={styles.tableRow}>
                      <td style={styles.cell}>
                        {indexOfFirstProject + index + 1}
                      </td>
                      <td style={styles.cell}>{project.name}</td>
                      <td style={styles.cell}>{project.monitor}</td>
                      <td style={styles.cell}>{project.filer}</td>
                      <td style={styles.cell}>
                        {calculateDurations(project.datestart, project.dateend)}{" "}
                        Tháng (
                        {calculateDuration(project.datestart, project.dateend)}{" "}
                        Ngày)
                      </td>
                      <td style={styles.cell}>{project.volume}</td>
                      <td style={styles.cell}>
                        <Link to={`/edit-job/${project.id}`}>
                          <FaEdit style={styles.icon} />
                        </Link>
                        &nbsp;&nbsp;
                        <FaTrashAlt
                          style={styles.icon}
                          onClick={() => {
                            const confirmDelete = window.confirm(
                              "Bạn có chắc chắn muốn xóa công việc này?"
                            );
                            if (confirmDelete) {
                              deleteJob(project.id);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Thêm nút phân trang */}
              <div style={styles.pagination}>
                {/* Nút lùi trang */}
                <button
                  onClick={() => paginate(currentPage - 1)}
                  style={styles.pageButton}
                  disabled={currentPage === 1} // Không cho phép lùi khi đang ở trang đầu tiên
                >
                  Trước
                </button>
                {Array.from(
                  { length: Math.ceil(projects.length / projectsPerPage) },
                  (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      style={
                        currentPage === i + 1
                          ? styles.activePage
                          : styles.pageButton
                      }
                    >
                      {i + 1}
                    </button>
                  )
                )}
                {/* Nút tiến trang */}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  style={styles.pageButton}
                  disabled={
                    currentPage === Math.ceil(projects.length / projectsPerPage)
                  } // Không cho phép tiến khi đang ở trang cuối cùng
                >
                  Tiếp
                </button>
              </div>
            </>
          )}
          <Link to="/add-job">
            <button style={styles.addButton}>Thêm dự án</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
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
    borderBottom: "1px solid #ddd",
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
    marginTop: "20px",
  },
  pageButton: {
    padding: "8px 12px",
    margin: "0 5px",
    border: "1px solid #ddd",
    cursor: "pointer",
    borderRadius: "4px",
    transition: "background-color 0.3s ease",
  },
  activePage: {
    backgroundColor: "#5961a3",
    color: "#fff",
    border: "1px solid #5961a3",
    padding: "5px 10px",
    margin: "0 5px",
    cursor: "pointer",
    borderRadius: "3px",
  },
};

export default Job;
