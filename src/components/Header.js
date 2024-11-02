import React from "react";
import { useLocation, useParams } from "react-router-dom";

function Header() {
  const location = useLocation(); // Lấy thông tin đường dẫn hiện tại
  const { id, reportId, scheduleId } = useParams(); // Lấy ID từ đường dẫn

  // Dựa trên đường dẫn để thay đổi tiêu đề
  const getTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Trang chủ";
      case `/profile/${id}`:
        return "Thông tin cá nhân";
      case "/alluser":
        return "Quản lý nhân viên";
      case "/timekeeping":
        return "Quản lý chấm công nhân sự";
      case "/track-progress":
        return "Theo dõi tiến độ thi công";
      case "/schedules":
        return "Danh sách lịch trình";
      case "/manager-schedule":
        return "Chi tiết lịch trình";
      case "/materials":
        return "Quản lý vật tư, cơ giới";
      case "/advance":
        return "Danh sách ứng tiền";
      case "/adduser":
        return "Thêm nhân viên";
      case `/edit-user/${id}`:
        return "Sửa thông tin nhân viên";

      // công việc
      case "/job":
        return "Quản lý các dự án";
      case "/add-job":
        return "Thêm dự án mới";
      case `/edit-job/${id}`: // Thay đổi đây
        return `Chỉnh sửa dự án`; // Hiển thị ID trong tiêu đề

      // MONITOR
      case "/monitor-job":
        return "Dự án công tác";
      case "/monitor-advance":
        return "Quản lý ứng tiền";
      case "/monitor-materials":
        return "Quản lý vật tư, cơ giới";
      case "/list-monitor-schedules":
        return "Danh sách lịch trình";
      case `/monitor-track-progress/${scheduleId}`:
        return "Theo dõi báo cáo";
      case "/list-monitor-track-progress":
        return "Theo dõi, báo cáo tiến độ";
      case `/report-detail/${scheduleId}/${reportId}`:
        return "Chi tiết báo cáo";
      case "/add-advance":
        return "Ứng tiền";
      case `/detail-job/${id}`:
        return "Chi tiết dự án công tác";
      case `/monitor-schedules/${id}`:
        return "Lên lịch trình";

      //FILER
      case "/filer-job":
        return "Dự án công tác";
      case "/filer-detail-job":
        return "Chi tiết dự án";
      //ACCOUNTANT
      case "/list-advance":
        return "Quản lý ứng tiền";
      default:
        return "Dashboards"; // Mặc định tiêu đề khi không trùng route
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0056b3",
        color: "white",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1 style={{ margin: 0 }}>{getTitle()}</h1>
    </div>
  );
}

export default Header;
