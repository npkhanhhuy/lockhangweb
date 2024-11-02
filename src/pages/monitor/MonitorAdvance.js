import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useAdvances } from "../../components/AdvanceContext";
import { auth } from "../../components/firebase";

import edits from "../../asset/write.png";
import remove from "../../asset/clear.png";

const MonitorAdvance = () => {
  const { advances, fetchAdvances, deleteAdvance } = useAdvances();
  const [userAdvances, setUserAdvances] = useState([]);
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 15;

  useEffect(() => {
    if (userId) {
      fetchAdvances(userId);
    }
  }, [userId, fetchAdvances]);

  useEffect(() => {
    if (advances.length > 0) {
      const filteredAdvances = advances.filter(
        (advance) => advance.id === userId
      );
      setUserAdvances(filteredAdvances);
    } else {
      setUserAdvances([]); // Reset nếu không có advances
    }
  }, [advances, userId]);

  const handleEdit = (advanceId) => {
    console.log("Edit advance with ID:", advanceId);
  };

  const handleDelete = async (advanceId, advanceToDeleteId) => {
    await deleteAdvance(advanceId, advanceToDeleteId);
    fetchAdvances(userId);
  };

  // Pagination Logic
  const totalRecords = userAdvances.reduce(
    (acc, item) => acc + item.advances.length,
    0
  );
  const totalPages = Math.ceil(totalRecords / recordsPerPage);

  const paginatedAdvances = userAdvances
    .reduce((acc, item) => {
      return acc.concat(
        item.advances.map((advance, idx) => ({
          ...advance,
          id: advance.id,
          advanceId: item.id,
          index: acc.length + idx + 1,
          createdBy: item.createdBy,
        }))
      );
    }, [])
    .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

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
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>STT</th>
                <th style={styles.th}>Người ứng</th>
                <th style={styles.th}>Số tiền</th>
                <th style={styles.th}>Lý do</th>
                <th style={styles.th}>Thời gian</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdvances.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.noDataText}>
                    Không có dữ liệu ứng tiền
                  </td>
                </tr>
              ) : (
                paginatedAdvances.map((advance) => (
                  <tr key={advance.id} style={styles.advanceItem}>
                    <td style={styles.td}>{advance.index}</td>
                    <td style={styles.td}>
                      {advance.createdBy || "Người dùng không xác định"}
                    </td>
                    <td style={styles.td}>{advance.amount}</td>
                    <td style={styles.td}>{advance.reason}</td>
                    <td style={styles.td}>{advance.date}</td>
                    <td style={styles.td}>{advance.status}</td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        style={styles.buttonmodal}
                        onClick={() => handleEdit(advance.id)}
                      >
                        <img
                          src={edits}
                          alt="Xóa lịch trình"
                          style={styles.img}
                        />
                      </button>
                      &nbsp;&nbsp;&nbsp;
                      <button
                        style={styles.buttonmodal}
                        onClick={() =>
                          handleDelete(advance.advanceId, advance.id)
                        }
                      >
                        <img
                          src={remove}
                          alt="Xóa lịch trình"
                          style={styles.img}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
          <div>
            <Link to={"/add-advance"}>
              <button style={styles.addButton}>Ứng tiền</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  advanceItem: {
    borderBottom: "1px solid #ddd",
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
  buttonmodal: {
    background: "none", // Không có nền
    border: "none", // Không có viền
    cursor: "pointer", // Thay đổi con trỏ khi di chuột qua
    padding: 0, // Không có padding
    outline: "none", // Không có viền khi nhấn
  },
  img: {
    width: "20px", // Chiều rộng ảnh
    height: "20px", // Chiều cao ảnh
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

export default MonitorAdvance;
