import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useMonitorJobs } from "../../components/MonitorJobContext";
import { db } from "../../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../../styles/Mnt.css";

const FilerSchedules = () => {
  const { id } = useParams();
  const {
    schedules,
    fetchSchedules,
    categories,
    fetchCategories,
    //loadFilteredSchedules
  } = useMonitorJobs(); // Sử dụng context mới
  const [monitor, setMonitor] = useState("");
  const [projectName, setProjectName] = useState("");
  const [successMessage] = useState("");
  const [errorMessage] = useState("");
  const [editingRowId] = useState(null);
  const [editedRow, setEditedRow] = useState({});

  const [selectedCategory, setSelectedCategory] = useState(""); // State để lưu category đã chọn
  // Fetch project name and schedules
  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const docRef = doc(db, "JOBS", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProjectName(data.name);
          setMonitor(data.monitor);
          fetchSchedules(id); // Thêm tham số id để lấy lịch trình đúng theo job id
          await fetchCategories(id); // Thêm tham số id để lấy hạng mục đúng theo job id
        } else {
          console.error("Không tìm thấy dự án.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dự án:", error);
      }
    };

    fetchProjectName();
  }, [id, fetchSchedules, fetchCategories]);

  const handleChange = (e) => {
    const selectedValue = e.target.value; // Giá trị đã chọn
    console.log("Selected category value:", selectedValue);
    setSelectedCategory(selectedValue);
  };

  useEffect(() => {
    if (selectedCategory) {
      fetchSchedules(selectedCategory);
    }
  }, [selectedCategory, fetchSchedules]);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div
        style={{ flexGrow: 1, backgroundColor: "#d1d5db", minHeight: "100vh" }}
      >
        <Header />
        <div style={{ padding: "20px" }}>
          <h2 style={{ marginBottom: "20px", color: "#333" }}>
            Lịch trình cho dự án: {projectName}
          </h2>
          <h3 style={{ marginBottom: "20px", color: "#333" }}>
            Giám sát: {monitor}
          </h3>
          <div>
            <select
              onChange={handleChange}
              aria-label="Chọn hạng mục"
              style={{ marginBottom: "10px" }}
            >
              <option value="">Chọn hạng mục</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <table
            style={{
              backgroundColor: "#fff",
              width: "100%",
              borderCollapse: "collapse",
              borderRadius: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#5961a3", color: "white" }}>
                <th
                  style={{
                    width: "5%",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  STT
                </th>
                <th
                  style={{
                    width: "20%",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  Thời hạn
                </th>
                <th
                  style={{
                    width: "20%",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  Công việc
                </th>
                <th
                  style={{
                    width: "15%",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  Nhân công
                </th>
                <th
                  style={{
                    width: "15%",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  Cơ giới
                </th>
                <th
                  style={{
                    width: "20%",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  Tiến độ hoàn thiện
                </th>
                <th
                  style={{
                    width: "15%",
                    padding: "10px",
                    border: "1px solid #ccc",
                  }}
                >
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules
                .filter((scheduleDoc) =>
                  selectedCategory
                    ? scheduleDoc.schedules.some(
                        (s) => s.category === selectedCategory
                      )
                    : true
                )
                .map((scheduleDoc) => (
                  <React.Fragment key={scheduleDoc.id}>
                    {Array.isArray(scheduleDoc.schedules) &&
                    scheduleDoc.schedules.length > 0 ? (
                      scheduleDoc.schedules
                        .filter((schedule) =>
                          selectedCategory
                            ? schedule.category === selectedCategory
                            : true
                        )
                        .map((schedule, index) => (
                          <tr key={schedule.id || index}>
                            {/* Sử dụng `id` thay vì `stt` */}
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                              }}
                            >
                              {index + 1}
                            </td>{" "}
                            {/* Hiển thị số thứ tự theo index */}
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                                display: "flex",
                                alignItems: "center",
                                height: "52px",
                              }}
                            >
                              {editingRowId === schedule.id ? ( // Sử dụng `id` thay vì `stt`
                                <>
                                  <input
                                    type="text"
                                    value={editedRow.datestart}
                                    onChange={(e) =>
                                      setEditedRow({
                                        ...editedRow,
                                        datestart: e.target.value,
                                      })
                                    }
                                    style={{
                                      padding: "5px",
                                      borderRadius: "4px",
                                      border: "1px solid #ccc",
                                      width: "45%",
                                      marginRight: "5px",
                                    }}
                                  />
                                  -
                                  <input
                                    type="text"
                                    value={editedRow.dateend}
                                    onChange={(e) =>
                                      setEditedRow({
                                        ...editedRow,
                                        dateend: e.target.value,
                                      })
                                    }
                                    style={{
                                      padding: "5px",
                                      borderRadius: "4px",
                                      border: "1px solid #ccc",
                                      width: "45%",
                                    }}
                                  />
                                </>
                              ) : (
                                `${schedule.datestart || "N/A"} đến ${
                                  schedule.dateend || "N/A"
                                }`
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                              }}
                            >
                              {editingRowId === schedule.id ? ( // Sử dụng `id` thay vì `stt`
                                <input
                                  type="text"
                                  value={editedRow.work}
                                  onChange={(e) =>
                                    setEditedRow({
                                      ...editedRow,
                                      work: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "5px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    width: "95%",
                                  }}
                                />
                              ) : (
                                schedule.work || "N/A"
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                              }}
                            >
                              {editingRowId === schedule.id ? ( // Sử dụng `id` thay vì `stt`
                                <input
                                  type="text"
                                  value={editedRow.workers}
                                  onChange={(e) =>
                                    setEditedRow({
                                      ...editedRow,
                                      workers: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "5px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    width: "95%",
                                  }}
                                />
                              ) : (
                                schedule.workers || "N/A"
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                              }}
                            >
                              {editingRowId === schedule.id ? ( // Sử dụng `id` thay vì `stt`
                                <input
                                  type="text"
                                  value={editedRow.vehicle}
                                  onChange={(e) =>
                                    setEditedRow({
                                      ...editedRow,
                                      vehicle: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "5px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    width: "95%",
                                  }}
                                />
                              ) : (
                                schedule.vehicle || "N/A"
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                              }}
                            >
                              {editingRowId === schedule.id ? ( // Sử dụng `id` thay vì `stt`
                                <input
                                  type="text"
                                  value={editedRow.complete}
                                  onChange={(e) =>
                                    setEditedRow({
                                      ...editedRow,
                                      complete: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "5px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    width: "95%",
                                  }}
                                />
                              ) : (
                                schedule.complete || "N/A"
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                              }}
                            >
                              {editingRowId === schedule.id ? ( // Sử dụng `id` thay vì `stt`
                                <input
                                  type="text"
                                  value={editedRow.notes}
                                  onChange={(e) =>
                                    setEditedRow({
                                      ...editedRow,
                                      notes: e.target.value,
                                    })
                                  }
                                  style={{
                                    padding: "5px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    width: "95%",
                                  }}
                                />
                              ) : (
                                schedule.notes || "N/A"
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          style={{
                            textAlign: "center",
                            padding: "10px",
                            border: "1px solid #ccc",
                          }}
                        >
                          Không có lịch trình nào cho hạng mục này.
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FilerSchedules;
