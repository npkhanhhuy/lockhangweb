import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../components/firebase"; // Đảm bảo đúng đường dẫn tới firebase config
import { doc, getDoc } from "firebase/firestore";
import Sidebar from "../../components/Sidebar"; // Đường dẫn đến Sidebar component
import Header from "../../components/Header"; // Đường dẫn đến Header component
import pdfIcon from "../../asset/pdf.jpg";

const DetailJob = () => {
  const { id } = useParams(); // Lấy id dự án từ URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "JOBS", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject(docSnap.data());
        } else {
          setError("Không tìm thấy dự án.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin dự án: ", error);
        setError("Có lỗi xảy ra khi tải dự án.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div
        style={{ flexGrow: 1, backgroundColor: "#d1d5db", minHeight: "100vh" }}
      >
        <Header />
        <div style={styles.container}>
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : project ? (
            <div style={styles.formContainer}>
              <div style={styles.detailsContainer}>
                <p style={styles.detail}>
                  <strong>Tên dự án:</strong> {project.name}
                </p>
                <p style={styles.detail}>
                  <strong>Mô tả công việc:</strong> {project.description}
                </p>
                <p style={styles.detail}>
                  <strong>Giám sát:</strong> {project.monitor}
                </p>
                <p style={styles.detail}>
                  <strong>Hồ sơ:</strong> {project.filer}
                </p>
                <p style={styles.detail}>
                  <strong>Ngày bắt đầu:</strong> {project.datestart}
                </p>
                <p style={styles.detail}>
                  <strong>Ngày kết thúc:</strong> {project.dateend}
                </p>
                <p style={styles.detail}>
                  <strong>Thời hạn:</strong>
                  {calculateDurations(project.datestart, project.dateend)} Tháng
                  ({calculateDuration(project.datestart, project.dateend)} Ngày)
                </p>
                <p style={styles.detail}>
                  <strong>Khối lượng:</strong> {project.volume}
                </p>
                <p style={styles.detail}>
                  <strong>Cơ giới:</strong> {project.vehicle}
                </p>
                <p style={styles.detail}>
                  <strong>Nhân lực:</strong> {project.persons}
                </p>
                <p style={styles.detail}>
                  <strong>Ghi chú:</strong> {project.notes}
                </p>
                <div style={styles.filesContainer}>
                  <strong>Hợp đồng chi tiết:</strong>
                  {project.file && project.file.length > 0 ? (
                    <ul style={styles.fileList}>
                      {project.file.map((file, index) => (
                        <li key={index} style={styles.fileItem}>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.fileLink}
                          >
                            <div style={styles.fileContainer}>
                              <img
                                src={pdfIcon}
                                alt="PDF Icon"
                                style={styles.pdfIcon}
                              />
                              <span style={styles.fileName}>{file.name}</span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Không có file nào được tải lên.</p>
                  )}
                </div>
              </div>
              <Link to={`/monitor-schedules/${id}`}>
                <button style={styles.button}>Lên lịch trình</button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    maxWidth: "600px",
    margin: "20px auto",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  detailsContainer: {
    margin: "10px 0",
  },
  detail: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "10px",
  },
  button: {
    display: "block",
    margin: "20px auto",
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.3s",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  filesContainer: {
    margin: "10px 0",
  },
  fileList: {
    listStyleType: "none",
    paddingLeft: "0",
  },
  fileItem: {
    marginBottom: "5px",
  },
  fileContainer: {
    display: "flex",
    alignItems: "center", // Căn giữa theo chiều dọc
  },
  pdfIcon: {
    width: "50px",
    height: "50px",
    marginRight: "10px", // Khoảng cách giữa icon và chữ
  },
  fileLink: {
    color: "black",
    textDecoration: "none", // Bỏ gạch chân
    display: "flex", // Để căn giữa nội dung trong thẻ a
    alignItems: "center", // Căn giữa theo chiều dọc
  },
  fileName: {
    marginLeft: "10px", // Khoảng cách giữa icon và tên file
  },
};

export default DetailJob;
