import React from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Link } from "react-router-dom";
import { useJobs } from "../../components/JobContext";
import { useUser } from "../../components/UserContext";
import { MdContentPasteSearch } from "react-icons/md";

const FileJob = () => {
  const { projects, loading, error } = useJobs();
  const { user } = useUser();

  const filteredProjects = projects.filter(
    (project) => project.filer === user.fullname
  ); // Giả sử fullname là tên của monitor

  const calculateDuration = (datestart, dateend) => {
    // Chuyển đổi định dạng từ "dd-mm-yyyy" thành đối tượng Date
    const startDate = new Date(datestart.split("-").reverse().join("-"));
    const endDate = new Date(dateend.split("-").reverse().join("-"));

    // Tính số ngày giữa hai ngày
    const timeDiff = endDate - startDate;
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    return dayDiff;
  };
  const calculateDurations = (datestart, dateend) => {
    const startDate = new Date(datestart.split("-").reverse().join("-"));
    const endDate = new Date(dateend.split("-").reverse().join("-"));
    const timeDiff = endDate - startDate;
    const monthDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 30.44)); // Tính số tháng
    return monthDiff;
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
                {filteredProjects.map((project, index) => (
                  <tr key={project.id} style={styles.tableRow}>
                    <td style={styles.cell}>{index + 1}</td>
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
                      <div>
                        {/* Chỉ hiển thị biểu tượng Edit và Delete cho dự án hiện tại */}
                        <Link to={`/filer-detail-job/${project.id}`}>
                          <MdContentPasteSearch style={styles.icon} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: {
    textAlign: "center",
    color: "#333",
    fontSize: "24px",
    marginBottom: "20px",
    fontWeight: "bold",
  },
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
};

export default FileJob;
