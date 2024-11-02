import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useParams } from "react-router-dom";
import { useMonitor } from "../../components/MonitorContext";
import { useUser } from "../../components/UserContext"; // Import UserContext

const ReportDetail = () => {
  const { reportId, scheduleId } = useParams();
  const { fetchReport, addReportForDay } = useMonitor();
  const { user } = useUser(); // Lấy thông tin người dùng từ UserContext
  const [reportData, setReportData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!reportId || !scheduleId) {
        console.error("reportId hoặc scheduleId không hợp lệ");
        setErrorMessage(
          "Có lỗi xảy ra: reportId hoặc scheduleId không hợp lệ."
        );
        return;
      }

      try {
        const fetchedReport = await fetchReport(scheduleId, reportId);
        if (fetchedReport) {
          setReportData(fetchedReport);
        }
      } catch (error) {
        console.error("Có lỗi xảy ra khi tải dữ liệu:", error);
        setErrorMessage("Có lỗi xảy ra khi tải dữ liệu.");
      }
    };

    loadData();
  }, [reportId, scheduleId, fetchReport]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSaveReport = async (shiftType) => {
    try {
      if (!scheduleId) {
        console.error(scheduleId);
        setErrorMessage(
          "Có lỗi xảy ra: reportId hoặc scheduleId không hợp lệ."
        );
        return;
      }

      // Dữ liệu sẽ được lưu dựa vào shiftType
      let updatedReport;

      if (shiftType === "Sáng") {
        updatedReport = {
          workers: reportData.workers || "",
          work: reportData.work || "",
          vehicle: reportData.vehicle || "",
          location: reportData.location || "",
          notesmorning: reportData.notesmorning || "",
          timemorning: formatDate(new Date()),
        };
      } else if (shiftType === "Chiều") {
        updatedReport = {
          expected: reportData.expected || "",
          workload: reportData.workload || "",
          complete: reportData.complete || "",
          notesevening: reportData.notesevening || "",
          timeevening: formatDate(new Date()),
        };
      }

      console.log("Dữ liệu báo cáo sẽ được cập nhật:", updatedReport);
      await addReportForDay(scheduleId, reportId, updatedReport);

      // Tải lại dữ liệu sau khi lưu thành công
      const refreshedReport = await fetchReport(scheduleId, reportId);
      if (refreshedReport) {
        setReportData(refreshedReport);
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật báo cáo:", error.message);
      setErrorMessage("Có lỗi xảy ra khi cập nhật báo cáo: " + error.message);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flexGrow: 1 }}>
        <Header />
        <div
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {errorMessage && <div style={styles.error}>{errorMessage}</div>}

          {/* Bảng báo cáo Sáng */}
          <div style={{ flex: 1, marginRight: "20px" }}>
            <h3 style={{ textAlign: "center" }}>Báo Cáo Sáng</h3>
            <h4>Ngày thi công: {reportData.date}</h4>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td>Thời gian:</td>
                  <td>{reportData.timemorning}</td>
                </tr>
                <tr>
                  <td>
                    <label>Nhân công:</label>
                  </td>
                  <td style={{ width: "84%" }}>
                    <input
                      style={styles.input}
                      type="text"
                      name="workers"
                      value={reportData.workers || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Công việc:</label>
                  </td>
                  <td>
                    <input
                      style={styles.input}
                      type="text"
                      name="work"
                      value={reportData.work || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Phương tiện:</label>
                  </td>
                  <td>
                    <input
                      style={styles.input}
                      type="text"
                      name="vehicle"
                      value={reportData.vehicle || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Địa điểm:</label>
                  </td>
                  <td>
                    <input
                      style={styles.input}
                      type="text"
                      name="location"
                      value={reportData.location || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Ghi chú:</label>
                  </td>
                  <td>
                    <textarea
                      style={styles.input}
                      name="notesmorning"
                      value={reportData.notesmorning || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Kiểm tra vai trò để ẩn hoặc hiển thị nút */}
            {user.role === "monitor" && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  style={styles.saveButton}
                  onClick={() => handleSaveReport("Sáng")}
                >
                  Lưu Báo Cáo
                </button>
              </div>
            )}
          </div>

          {/* Bảng báo cáo Chiều */}
          <div style={{ flex: 1 }}>
            <h3 style={{ textAlign: "center", marginBottom: "60px" }}>
              Báo Cáo Chiều
            </h3>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td>Thời gian:</td>
                  <td>{reportData.timeevening}</td>
                </tr>
                <tr>
                  <td>
                    <label>Hoàn thành:</label>
                  </td>
                  <td style={{ width: "85%" }}>
                    <input
                      style={styles.input}
                      type="text"
                      name="complete"
                      value={reportData.complete || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Khối lượng:</label>
                  </td>
                  <td>
                    <input
                      style={styles.input}
                      type="text"
                      name="workload"
                      value={reportData.workload || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Dự kiến:</label>
                  </td>
                  <td>
                    <input
                      style={styles.input}
                      type="text"
                      name="expected"
                      value={reportData.expected || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
                <tr>
                  <td>
                    <label>Ghi chú:</label>
                  </td>
                  <td>
                    <textarea
                      style={styles.input}
                      name="notesevening"
                      value={reportData.notesevening || ""}
                      onChange={handleInputChange}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Kiểm tra vai trò để ẩn hoặc hiển thị nút */}
            {user.role === "monitor" && (
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  style={styles.saveButton}
                  onClick={() => handleSaveReport("Chiều")}
                >
                  Lưu Báo Cáo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    backgroundColor: "#f8f9fa",
    height: "100vh",
  },
  sidebar: {
    width: "250px",
  },
  content: {
    flexGrow: 1,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#0056b3",
    color: "white",
    borderRadius: "4px",
  },
  title: {
    margin: "0 0 20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "column", // Sắp xếp theo chiều dọc
    marginBottom: "20px", // Khoảng cách dưới giữa các input
  },
  input: {
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "100%", // Chiếm toàn bộ chiều rộng của ô td
    boxSizing: "border-box",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between", // Để các nút nằm ở hai bên
    marginBottom: "20px", // Khoảng cách dưới nếu cần
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#0056b3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    flex: 1, // Để các nút chiếm không gian bằng nhau
    margin: "0 5px", // Khoảng cách giữa hai nút
  },
  buttons: {
    padding: "10px 20px",
    backgroundColor: "#0056b3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  error: {
    color: "red",
    marginBottom: "10px",
  },
  saveButton: {
    padding: "10px 20px",
    backgroundColor: "#0056b3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default ReportDetail;
