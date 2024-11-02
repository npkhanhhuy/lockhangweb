// pages/AddJob.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useJobs } from '../components/JobContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AddJob.css';
import pdfIcon from '../asset/pdf.jpg';

const AddJob = () => {
  const { addJob, monitors, filers } = useJobs(); // Lấy hàm addJob từ context
  const [newJob, setNewJob] = useState({
    name: '',
    description: '',
    monitor: '',
    filer: '',
    datestart: '',
    dateend: '',
    volume: '',
    notes: '',
    persons: '',
    vehicle: '',
    file: null, // Thêm file vào state
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filePreviews, setFilePreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();

  // Hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob((prevJob) => ({
      ...prevJob,
      [name]: value,
    }));
  };

  // Hàm xử lý thay đổi file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Chuyển đổi FileList thành mảng
    const validFiles = files.filter(file => file.type === 'application/pdf'); // Chỉ giữ lại file PDF

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      const previewURLs = validFiles.map(file => URL.createObjectURL(file)); // Tạo URL preview
      setFilePreviews(previewURLs); // Cập nhật state cho việc xem trước
    } else {
      alert("Vui lòng chọn file PDF hợp lệ.");
    }
  };


  // Hàm submit thêm dự án
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formatDateToISO = (dateStr) => {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    };

    const datestart = newJob.datestart ? new Date(formatDateToISO(newJob.datestart)) : null;
    const dateend = newJob.dateend ? new Date(formatDateToISO(newJob.dateend)) : null;

    if (dateend < datestart) {
      setError("Ngày kết thúc không được trước ngày bắt đầu.");
      setLoading(false);
      return;
    }

    // Kiểm tra định dạng ngày nếu cần
    if (newJob.datestart && isNaN(datestart)) {
      alert('Vui lòng nhập ngày bắt đầu hợp lệ (dd-mm-yyyy).');
      setLoading(false);
      return;
    }

    if (newJob.dateend && isNaN(dateend)) {
      alert('Vui lòng nhập ngày kết thúc hợp lệ (dd-mm-yyyy).');
      setLoading(false);
      return;
    }

    try {
      // Gọi hàm addJob từ JobContext
      await addJob({
        ...newJob,
        files: selectedFiles,
      });
      
      setSuccessMessage('Dự án mới đã được thêm thành công!');
      setNewJob({
        name: '',
        description: '',
        monitor: '',
        filer: '',
        datestart: '',
        dateend: '',
        volume: '',
        notes: '',
        persons: '',
        vehicle: '',
        file: null,
      });
      setSelectedFiles([]);
      setFilePreviews([]);

      // Điều hướng sau khi thành công
      navigate('/job');
    } catch (error) {
      setError('Có lỗi xảy ra khi thêm dự án.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, backgroundColor: '#d1d5db' }}>
        <Header />
        <div className="form-container">
          <form onSubmit={handleSubmit} className="job-form">
            <div className="form-group">
              <label>Tên dự án:</label>
              <input
                type="text"
                name="name"
                value={newJob.name}
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
                value={newJob.monitor}
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
                value={newJob.filer}
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
                value={newJob.datestart}
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
                value={newJob.dateend}
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
                value={newJob.description}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Nhập công việc"
              />
            </div>
            <div className="form-group">
              <label>Phương tiện:</label>
              <input
                type="text"
                name="vehicle"
                value={newJob.vehicle}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Nhập phương tiện"
              />
            </div>
            <div className="form-group">
              <label>Đội công nhân (số lượng):</label>
              <input
                type="text"
                name="persons"
                value={newJob.persons}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Nhập công nhân"
              />
            </div>
            <div className="form-group">
              <label>Khối lượng:</label>
              <input
                type="text"
                name="volume"
                value={newJob.volume}
                onChange={handleInputChange}
                required
                className="form-input"
                placeholder="Nhập khối lượng (ví dụ: 500m3)"
              />
            </div>
            <div className="form-group">
              <label>Ghi chú:</label>
              <textarea
                name="notes"
                value={newJob.notes}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Nhập ghi chú cho dự án"
              />
            </div>
            <div className="form-group">
              <label>Tải lên file PDF:</label>
              <input
                type="file"
                name="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                className="form-input"
              />
            </div>

            {filePreviews.length > 0 && (
              <div className="file-preview">
                {filePreviews.map((filePreview, index) => (
                  <div className="file-item" key={index}>
                    <a href={filePreview} target="_blank" rel="noopener noreferrer">
                      <img src={pdfIcon} alt="PDF Icon" style={{ width: 50, height: 50 }} />
                      <span className="file-name">{selectedFiles[index].name}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Thêm dự án'}
            </button>

            {successMessage && <p className="success-message">{successMessage}</p>}
            {error && <p className="error-message">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJob;
