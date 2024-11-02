import React, { useEffect, useState } from "react";
import { useAdvances } from "../../components/AdvanceContext"; // Nhập AdvanceContext
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

const ListAdvance = () => {
  const { advances, fetchAdvances, approveAdvance, addImageToAdvance } =
    useAdvances(); // Lấy dữ liệu từ context
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentAdvanceId, setCurrentAdvanceId] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);

  useEffect(() => {
    fetchAdvances(); // Lấy danh sách ứng tiền khi trang được tải
  }, [fetchAdvances]);

  const handleApprove = async (advanceId, itemId) => {
    await approveAdvance(advanceId, itemId);
    fetchAdvances();
  };

  const handleAddImage = (advanceId, itemId) => {
    setCurrentAdvanceId(advanceId); // Lưu advanceId
    setCurrentItemId(itemId); // Lưu itemId
    setSelectedImage(null); // Reset image selected
    setIsModalOpen(true); // Mở modal
  };

  const handleViewImage = (advanceId, itemId) => {
    const advance = advances.find((a) => a.id === advanceId);
    if (advance) {
      const item = advance.advances.find((i) => i.id === itemId);
      if (item && item.image) {
        setSelectedImage(item.image); // Lưu URL của ảnh đã tải lên
        setIsModalOpen(true); // Mở modal
      } else {
        alert("Chưa có ảnh nào cho mục này.");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // Lưu file đã chọn
    }
  };

  const handleUploadImage = async () => {
    if (selectedImage && currentAdvanceId !== null && currentItemId !== null) {
      await addImageToAdvance(currentAdvanceId, currentItemId, selectedImage);
      setSelectedImage(null); // Reset ảnh đã chọn
      setIsModalOpen(false); // Đóng modal
    } else {
      alert("Vui lòng chọn ảnh và xác định advance/item!");
    }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.content}>
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
                <th style={styles.tableHeader}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {advances.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.noDataText}>
                    Không có dữ liệu ứng tiền
                  </td>
                </tr>
              ) : (
                advances.flatMap((advance, index) =>
                  advance.advances.map((item, subIndex) => (
                    <tr
                      key={`${advance.id}-${subIndex}`}
                      style={styles.advanceItem}
                    >
                      <td style={styles.advanceText}>
                        {advances
                          .slice(0, index)
                          .reduce(
                            (total, curr) => total + curr.advances.length,
                            0
                          ) +
                          subIndex +
                          1}
                      </td>
                      <td style={styles.advanceText}>
                        {advance.createdBy || "Người dùng không xác định"}
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
                          onClick={() => handleApprove(advance.id, item.id)}
                        >
                          Đã chuyển
                        </button>
                      </td>
                      <td style={styles.advanceText}>
                        <button
                          onClick={() => handleAddImage(advance.id, item.id)}
                        >
                          Thêm ảnh
                        </button>
                        <button
                          onClick={() => handleViewImage(advance.id, item.id)}
                          style={{ marginLeft: "10px" }}
                        >
                          Xem ảnh
                        </button>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
        {isModalOpen && (
          <div style={styles.modal}>
            <h2>
              {currentAdvanceId !== null && currentItemId !== null
                ? "Thêm ảnh cho ứng tiền"
                : "Xem ảnh"}
            </h2>
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Uploaded"
                style={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            )}
            {currentAdvanceId !== null && currentItemId !== null ? (
              <button onClick={handleUploadImage}>Tải lên</button>
            ) : null}
            <button onClick={() => setIsModalOpen(false)}>Đóng</button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  content: {
    flexGrow: 1,
    padding: "20px",
    backgroundColor: "#fff",
    overflowY: "auto",
  },
  tableContainer: {
    marginTop: "20px",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
  },
  advanceTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#5961a3",
    color: "#fff",
    padding: "10px",
    textAlign: "left",
  },
  advanceItem: {
    backgroundColor: "#f9f9f9",
  },
  advanceText: {
    padding: "10px",
    border: "1px solid #ddd",
  },
  noDataText: {
    textAlign: "center",
    padding: "20px",
    color: "#888",
  },
  modal: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
    zIndex: 1000,
  },
};

export default ListAdvance;
