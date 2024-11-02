import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMonitorJobs } from "../../components/MonitorJobContext";
import { useUser } from "../../components/UserContext";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { MdContentPasteSearch } from "react-icons/md";

const ListSchedules = () => {
  const location = useLocation();
  const { schedules, error, fetchSchedulesMonitor } = useMonitorJobs();
  const { user } = useUser();

  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const itemsPerPage = 15; // Số lượng bản ghi mỗi trang

  useEffect(() => {
    if (user) {
      fetchSchedulesMonitor(user.fullname); // Gọi hàm fetch với fullname của user
    }
  }, [fetchSchedulesMonitor, user, location]);

  // Kiểm tra nếu không có user, hiển thị thông báo hoặc component khác
  if (!user) {
    return (
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div
          style={{
            flexGrow: 1,
            backgroundColor: "#d1d5db",
            minHeight: "100vh",
          }}
        >
          <Header />
          <div style={{ padding: "20px", textAlign: "center" }}>
            Đang tải dữ liệu .......
          </div>
        </div>
      </div>
    );
  }

  // Tính toán số lượng trang
  const totalPages = Math.ceil(schedules.length / itemsPerPage);

  // Xác định danh sách lịch trình hiện tại theo trang
  const currentSchedules = schedules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>STT</th>
                    <th style={styles.th}>Tên dự án</th>
                    <th style={styles.th}>Ngày tạo</th>
                    <th style={styles.th}>Người tạo</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentSchedules.map((schedule, index) => (
                    <tr
                      key={schedule.id || `schedule-${index}`}
                      style={styles.hoverRow}
                    >
                      <td style={styles.td}>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td style={styles.td}>{schedule.projectName}</td>
                      <td style={styles.td}>{schedule.createdAt}</td>
                      <td style={styles.td}>{schedule.createdBy}</td>
                      <td
                        style={{
                          textAlign: "center",
                          border: "1px solid #ddd",
                        }}
                      >
                        <Link to={`/monitor-schedules/${schedule.id}`}>
                          <button style={styles.buttonmodal}>
                            <MdContentPasteSearch style={styles.icon} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Điều hướng phân trang */}
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

// Đối tượng styles
const styles = {
  container: {
    display: "flex",
  },
  tableContainer: {
    padding: "20px",
    flexGrow: 1,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  th: {
    padding: "12px",
    textAlign: "left",
    border: "1px solid #ddd",
    backgroundColor: "#5961a3",
    color: "white",
  },
  td: {
    padding: "12px",
    textAlign: "left",
    border: "1px solid #ddd",
  },
  hoverRow: {
    "&:hover": {
      backgroundColor: "#f1f1f1",
    },
  },
  centeredCell: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#555",
  },
  buttonmodal: {
    background: "none", // Không có nền
    border: "none", // Không có viền
    cursor: "pointer", // Thay đổi con trỏ khi di chuột qua
    padding: 0, // Không có padding
    outline: "none", // Không có viền khi nhấn
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

export default ListSchedules;
