import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useMonitor } from "../../components/MonitorContext";
import { MdContentPasteSearch } from "react-icons/md";

const MonitorTrackProgress = () => {
  const { scheduleId } = useParams(); // Lấy scheduleId từ URL
  const { selectedReport, fetchScheduleAndGenerateReport } = useMonitor();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (scheduleId) {
        try {
          setLoading(true);
          setError(null);

          await fetchScheduleAndGenerateReport(scheduleId);
        } catch (err) {
          console.error("Error fetching report data:", err);
          setError("Có lỗi xảy ra khi tải dữ liệu báo cáo.");
        } finally {
          setLoading(false);
        }
      } else {
        console.log("Schedule ID is missing!");
        setLoading(false);
      }
    };

    fetchData();
  }, [scheduleId, fetchScheduleAndGenerateReport]); // Thêm fetchScheduleAndGenerateReport vào dependencies

  useEffect(() => {
    console.log("Selected report:", selectedReport);
  }, [selectedReport]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flexGrow: 1 }}>
        <Header />
        <div style={{ padding: "20px" }}>
          <table style={{ width: "50%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Ngày
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {" "}
                  Công việc
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "center", padding: "10px" }}
                  >
                    Đang tải dữ liệu báo cáo...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      padding: "10px",
                      color: "red",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              ) : selectedReport && selectedReport.length > 0 ? (
                selectedReport.map((report, index) => (
                  <tr key={index}>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {report.date}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      {report.work || "Chưa báo cáo"}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                      <Link
                        to={`/report-detail/${scheduleId}/${report.reportId}`}
                      >
                        <button style={styles.buttonmodal}>
                          <MdContentPasteSearch style={styles.icon} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      textAlign: "center",
                      padding: "10px",
                    }}
                  >
                    Không có dữ liệu báo cáo để hiển thị.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  buttonmodal: {
    background: "none", // Không có nền
    border: "none", // Không có viền
    cursor: "pointer", // Thay đổi con trỏ khi di chuột qua
    padding: 0, // Không có padding
    outline: "none", // Không có viền khi nhấn
  },
  icon: {
    width: "20px",
    height: "20px",
  },
};
export default MonitorTrackProgress;
