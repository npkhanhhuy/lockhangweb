import React, { useEffect, useState } from "react";
import { useAdvances } from "../components/AdvanceContext"; // Nhập AdvanceContext
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import clearIcon from "../asset/clear.png";
import checkIcon from "../asset/check.png";

const Advance = () => {
  const { advances, fetchAdvances, updateAdvanceStatus, rejectAdvance } =
    useAdvances(); // Lấy dữ liệu từ context

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Số lượng mục hiển thị trên mỗi trang

  useEffect(() => {
    fetchAdvances(); // Lấy danh sách ứng tiền khi trang được tải
  }, [fetchAdvances]);

  const handleApprove = async (advanceId, itemId) => {
    await updateAdvanceStatus(advanceId, itemId);
    fetchAdvances();
  };

  const handleReject = async (advanceId, itemId) => {
    await rejectAdvance(advanceId, itemId);
    fetchAdvances();
  };

  // Tính toán dữ liệu cho trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAdvances = advances
    .flatMap((advance) => advance.advances)
    .slice(indexOfFirstItem, indexOfLastItem);

  // Tổng số trang
  const totalPages = Math.ceil(
    advances.flatMap((advance) => advance.advances).length / itemsPerPage
  );
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div
        style={{ flexGrow: 1, backgroundColor: "#d1d5db", minHeight: "100vh" }}
      >
        <Header />
        <div style={styles.tableContainer}>
          <table style={styles.advanceTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>STT</th>
                <th style={styles.tableHeader}>Người ứng</th>
                <th style={styles.tableHeader}>Số tiền</th>
                <th style={styles.tableHeader}>Lý do</th>
                <th style={styles.tableHeader}>Thời gian</th>
                <th style={styles.tableHeader}>Trạng thái</th>
                <th style={styles.tableHeader}>Phê duyệt</th>
              </tr>
            </thead>
            <tbody>
              {currentAdvances.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.noDataText}>
                    Không có dữ liệu ứng tiền
                  </td>
                </tr>
              ) : (
                currentAdvances.map((item, index) => (
                  <tr key={item.id} style={styles.advanceItem}>
                    <td style={styles.advanceText}>
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td style={styles.advanceText}>
                      {item.createdBy || "Người dùng không xác định"}
                    </td>
                    <td style={styles.advanceText}>
                      {item.amount || "Không có số tiền"}
                    </td>
                    <td style={styles.advanceText}>
                      {item.reason || "Không có lý do"}
                    </td>
                    <td style={styles.advanceText}>
                      {item.date || "Không có thời gian"}
                    </td>
                    <td style={styles.advanceText}>
                      {item.status || "Không có trạng thái"}
                    </td>
                    <td style={styles.advanceText}>
                      <button
                        onClick={() => handleApprove(item.advanceId, item.id)}
                        style={styles.buttonmodal}
                      >
                        <img
                          src={checkIcon}
                          alt="Phê duyệt"
                          style={styles.deleteIcon}
                        />
                      </button>
                      &nbsp;&nbsp;&nbsp;
                      <button
                        onClick={() => handleReject(item.advanceId, item.id)}
                        style={styles.buttonmodal}
                      >
                        <img
                          src={clearIcon}
                          alt="Từ chối"
                          style={styles.deleteIcon}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            Lùi
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            Tiến
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  tableContainer: {
    margin: "20px",
    width: "97%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
  advanceTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#5961a3",
    padding: "10px",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
    fontWeight: "bold",
    color: "#fff",
  },
  advanceItem: {
    borderBottom: "1px solid #ddd",
    transition: "background-color 0.3s",
  },
  advanceText: {
    padding: "10px",
    fontSize: "16px",
  },
  noDataText: {
    fontSize: "18px",
    color: "#888",
    textAlign: "center",
    marginTop: "20px",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  deleteIcon: {
    width: "20px",
    height: "20px",
    verticalAlign: "middle",
  },
  buttonmodal: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    outline: "none",
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

export default Advance;
