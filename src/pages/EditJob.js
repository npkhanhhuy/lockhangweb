import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useJobs } from "../components/JobContext";
import { useNavigate, useParams } from "react-router-dom";
import pdfIcon from "../asset/pdf.jpg";
import deleteIcon from "../asset/delete.png";

const EditJob = () => {
  const { projects, updateJob, monitors, filers } = useJobs();
  const { id } = useParams();
  const navigate = useNavigate();

  const [editedJob, setEditedJob] = useState({
    name: "",
    description: "",
    monitor: "",
    filer: "",
    datestart: "",
    dateend: "",
    volume: "",
    notes: "",
    persons: "",
    vehicle: "",
    createdAt: "",
    file: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filePreviewURLs, setFilePreviewURLs] = useState([]);
  const [filesToRemove, setFilesToRemove] = useState([]);

  useEffect(() => {
    if (id) {
      const existingJob = projects.find((project) => project.id === id);
      if (existingJob) {
        setEditedJob(existingJob);
        if (existingJob.file && Array.isArray(existingJob.file)) {
          fetchFilesFromFirebase(existingJob.file);
        }
      }
    }
  }, [id, projects]);

  const fetchFilesFromFirebase = async (fileList) => {
    try {
      const urls = fileList.map((file) => file.url);
      setFilePreviewURLs(urls);
    } catch (error) {
      console.error("Lỗi khi lấy file từ Firebase:", error);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file && file.type === "application/pdf"
    );

    if (validFiles.length > 0) {
      const existingFileNames = editedJob.file.map((file) => file.name);
      const newFilesToAdd = validFiles.filter(
        (file) => !existingFileNames.includes(file.name)
      );

      if (newFilesToAdd.length > 0) {
        setEditedJob((prevJob) => ({
          ...prevJob,
          file: [...(prevJob.file || []), ...newFilesToAdd],
        }));

        setFilePreviewURLs((prevURLs) => [
          ...prevURLs,
          ...newFilesToAdd.map((file) => URL.createObjectURL(file)),
        ]);
      } else {
        alert("Tất cả file đã tồn tại.");
      }
    } else {
      alert("Vui lòng chọn file PDF hợp lệ.");
    }
  };

  const handleRemoveFile = (fileIndex) => {
    const fileToRemove = editedJob.file[fileIndex];

    // Thêm file vào danh sách cần xóa
    setFilesToRemove((prevFiles) => [...prevFiles, fileToRemove.name]);

    // Cập nhật lại danh sách file trong state
    setEditedJob((prevJob) => {
      const updatedFiles = prevJob.file.filter(
        (_, index) => index !== fileIndex
      );
      return {
        ...prevJob,
        file: updatedFiles,
      };
    });

    // Cập nhật lại danh sách URL xem trước
    setFilePreviewURLs((prevURLs) =>
      prevURLs.filter((_, index) => index !== fileIndex)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedJob((prevJob) => ({
      ...prevJob,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formatDateToISO = (dateStr) => {
      const [day, month, year] = dateStr.split("-");
      return `${year}-${month}-${day}`;
    };

    const datestart = editedJob.datestart
      ? new Date(formatDateToISO(editedJob.datestart))
      : null;
    const dateend = editedJob.dateend
      ? new Date(formatDateToISO(editedJob.dateend))
      : null;

    if (dateend < datestart) {
      setError("Ngày kết thúc không được trước ngày bắt đầu.");
      setLoading(false);
      return;
    }

    if (editedJob.datestart && isNaN(datestart)) {
      alert("Vui lòng nhập ngày bắt đầu hợp lệ (dd-mm-yyyy).");
      setLoading(false);
      return;
    }

    if (editedJob.dateend && isNaN(dateend)) {
      alert("Vui lòng nhập ngày kết thúc hợp lệ (dd-mm-yyyy).");
      setLoading(false);
      return;
    }

    try {
      await updateJob(id, { ...editedJob, filesToRemove });
      setSuccessMessage("Dự án đã được cập nhật thành công!");
      navigate("/job");
    } catch (error) {
      setError("Có lỗi xảy ra khi cập nhật dự án.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <Sidebar />
      <div style={{ flexGrow: 1, backgroundColor: "#d1d5db" }}>
        <Header />
        <div className="form-container">
          {editedJob ? ( // Kiểm tra xem có job đã được chỉnh sửa không
            <form onSubmit={handleSubmit} className="job-form">
              <div>
                <p>
                  <strong>Ngày tạo dự án: </strong>
                  {editedJob.createdAt}
                </p>
              </div>
              <div>
                <p>
                  <strong>Ngày chỉnh sửa dự án: </strong>
                  {editedJob.updatedAt}
                </p>
              </div>
              <div className="form-group">
                <label>Tên dự án:</label>
                <input
                  type="text"
                  name="name"
                  value={editedJob.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập tên công việc"
                />
              </div>
              <div className="form-group">
                <label>Nhân viên giám sát:</label>
                <select
                  name="monitor"
                  value={editedJob.monitor}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Chọn nhân viên giám sát</option>
                  {monitors.length > 0 ? (
                    monitors.map((monitor) => (
                      <option key={monitor.id} value={monitor.fullname}>
                        {monitor.fullname}
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có giám sát nào</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Nhân viên hồ sơ:</label>
                <select
                  name="filer"
                  value={editedJob.filer}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Chọn nhân viên hồ sơ</option>
                  {filers.length > 0 ? (
                    filers.map((filer) => (
                      <option key={filer.id} value={filer.fullname}>
                        {filer.fullname}
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có nhân viên hồ sơ nào</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày bắt đầu:</label>
                <input
                  type="text"
                  name="datestart"
                  value={editedJob.datestart}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập ngày bắt đầu (dd-mm-yyyy)"
                />
              </div>
              <div className="form-group">
                <label>Ngày kết thúc:</label>
                <input
                  type="text"
                  name="dateend"
                  value={editedJob.dateend}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập ngày kết thúc (dd-mm-yyyy)"
                />
              </div>
              <div className="form-group">
                <label>Mô tả công việc:</label>
                <input
                  type="text"
                  name="description"
                  value={editedJob.description}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập mô tả công việc"
                />
              </div>
              <div className="form-group">
                <label>Phương tiện:</label>
                <input
                  type="text"
                  name="vehicle"
                  value={editedJob.vehicle}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập mô tả phương tiện"
                />
              </div>
              <div className="form-group">
                <label>Đội nhân công (số lượng):</label>
                <input
                  type="text"
                  name="persons"
                  value={editedJob.persons}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập số lượng công nhân"
                />
              </div>
              <div className="form-group">
                <label>Khối lượng:</label>
                <input
                  type="text"
                  name="volume"
                  value={editedJob.volume}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Nhập khối lượng công việc"
                />
              </div>
              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  name="notes"
                  value={editedJob.notes}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nhập ghi chú thêm"
                />
              </div>
              <div className="form-group">
                <label>Upload file PDF:</label>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileChange}
                  className="form-input"
                />
                <div className="file-preview">
                  {filePreviewURLs.map((url, index) => (
                    <div key={index} style={styles.fileItem}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.fileLink}
                      >
                        <img
                          src={pdfIcon}
                          alt="PDF Icon"
                          style={styles.pdfIcon}
                        />
                        {editedJob.file[index].name}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        style={styles.removeBtn}
                      >
                        <img
                          src={deleteIcon}
                          alt="delete icon"
                          style={styles.deleteIcon}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? "Đang tải..." : "Cập nhật dự án"}
                </button>
              </div>
              {error && <div className="error-message">{error}</div>}
              {successMessage && (
                <div className="success-message">{successMessage}</div>
              )}
            </form>
          ) : (
            <div>Không tìm thấy dự án.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "10px 0",
    padding: "5px",
  },
  fileLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "black",
    flexGrow: 1,
  },
  pdfIcon: {
    width: "50px",
    height: "50px",
    marginRight: "10px",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    marginLeft: "5px", // Giảm khoảng cách với tên file
  },
  deleteIcon: {
    width: "20px",
    height: "20px",
    verticalAlign: "middle",
  },
};

export default EditJob;
