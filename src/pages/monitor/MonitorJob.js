import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Link } from "react-router-dom";
import { useJobs } from "../../components/JobContext";
import { useUser } from "../../components/UserContext";
import { MdContentPasteSearch } from "react-icons/md";

const MonitorJob = () => {
  const { projects, loading, error } = useJobs();
  const { user } = useUser();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Số lượng mục hiển thị trên mỗi trang

  const filteredProjects = projects.filter(
    (project) => project.monitor === user.fullname
  ); // Giả sử fullname là tên của monitor

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

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
                    <th style={styles.headerCell}>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProjects.map((project, index) => (
                    <tr key={project.id} style={styles.tableRow}>
                      <td style={styles.cell}>
                        {indexOfFirstItem + index + 1}
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
                        <Link to={`/detail-job/${project.id}`}>
                          <MdContentPasteSearch style={styles.icon} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Phân trang */}
              <div style={styles.pagination}>
                <button
                  style={{ ...styles.pageButton, marginRight: "10px" }}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    style={{
                      ...styles.pageButton,
                      backgroundColor:
                        currentPage === index + 1 ? "#5961a3" : "#fff",
                      color: currentPage === index + 1 ? "#fff" : "#000",
                    }}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  style={{ ...styles.pageButton, marginLeft: "10px" }}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Tiếp
                </button>
              </div>
            </>
          )}
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
};

export default MonitorJob;
