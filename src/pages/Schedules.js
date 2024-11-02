import React, { useState, useEffect } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../components/firebase";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { MdContentPasteSearch } from "react-icons/md";
import { Link } from "react-router-dom";

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Số lượng mục hiển thị trên mỗi trang

  const fetchSchedules = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "schedules"));
      const scheduleData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSchedules(scheduleData);
    } catch (err) {
      console.error("Lỗi khi tải danh sách lịch trình: ", err);
      setError("Không thể tải danh sách lịch trình.");
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Tính toán dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchedules = schedules.slice(indexOfFirstItem, indexOfLastItem);

  // Chuyển sang trang mới
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Tổng số trang
  const totalPages = Math.ceil(schedules.length / itemsPerPage);

  // Hàm chuyển trang trước
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Hàm chuyển trang tiếp theo
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
                  <tr style={styles.tableHeader}>
                    <th style={styles.headerCell}>STT</th>
                    <th style={styles.headerCell}>Tên dự án</th>
                    <th style={styles.headerCell}>Ngày tạo</th>
                    <th style={styles.headerCell}>Người tạo</th>
                    <th style={styles.headerCell}>Xem chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSchedules.map((schedule, index) => (
                    <tr
                      key={schedule.id || `schedule-${index}`}
                      style={styles.tableRow}
                    >
                      <td style={styles.cell}>
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td style={styles.cell}>{schedule.projectName}</td>
                      <td style={styles.cell}>{schedule.createdAt}</td>
                      <td style={styles.cell}>{schedule.createdBy}</td>
                      <td style={styles.cell}>
                        <Link to={`/mananger-schedule/${schedule.id}`}>
                          <button style={styles.iconButton}>
                            <MdContentPasteSearch style={styles.icon} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Phân trang */}
              <div style={styles.pagination}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  style={styles.pageButton}
                >
                  Trước
                </button>
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    style={{
                      ...styles.pageButton,
                      backgroundColor:
                        currentPage === number + 1 ? "#5961a3" : "#fff",
                      color: currentPage === number + 1 ? "#fff" : "#000",
                    }}
                  >
                    {number + 1}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Đối tượng styles
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
    padding: "12px",
    border: "1px solid #ddd",
  },
  tableRow: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #ddd",
    transition: "background-color 0.3s ease",
  },
  cell: {
    padding: "12px",
    textAlign: "center",
    color: "#000",
    borderBottom: "1px solid #ddd",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    outline: "none",
  },
  icon: {
    fontSize: "1.2em",
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
    cursor: "pointer",
    border: "1px solid #ddd",
    borderRadius: "4px",
    backgroundColor: "#fff",
  },
};

export default Schedules;
