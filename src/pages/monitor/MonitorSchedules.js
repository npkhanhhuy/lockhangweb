import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { useMonitorJobs } from "../../components/MonitorJobContext";
import { db } from "../../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../../styles/Mnt.css";

import edits from "../../asset/write.png";
import remove from "../../asset/clear.png";
import plus from "../../asset/plus.png";
import report from "../../asset/report.png";

const MonitorSchedules = () => {
  const { id } = useParams();
  const {
    schedules,
    fetchSchedules,
    addSchedule,
    deleteSchedule,
    updateSchedule,
    addCategory,
    deleteCategory,
    categories,
    updateCategory,
    fetchCategories,
    //loadFilteredSchedules
  } = useMonitorJobs(); // Sử dụng context mới
  const [monitor, setMonitor] = useState("");
  const [projectName, setProjectName] = useState("");
  const [newRows, setNewRows] = useState([
    {
      work: "",
      workers: "",
      notes: "",
      datestart: "",
      dateend: "",
      complete: "",
    },
  ]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [originalRow, setOriginalRow] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(""); // State để lưu category đã chọn
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentRowCount, setCurrentRowCount] = useState(0);
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

  // Thêm hàng mới vào lịch trình
  useEffect(() => {
    if (selectedCategory) {
      const rowCount = schedules
        .flatMap((scheduleDoc) => scheduleDoc.schedules)
        .filter((item) => item.category === selectedCategory).length; // Lọc theo category đã chọn
      setCurrentRowCount(rowCount);
    }
  }, [schedules, selectedCategory]);

  const handleAddRow = () => {
    const generateRandomId = () => {
      return `sche-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
    };

    const newRow = {
      id: generateRandomId(), // Sử dụng ID ngẫu nhiên
      work: "",
      workers: "",
      notes: "",
      datestart: "",
      dateend: "",
      complete: "",
      vehicle: "",
    };

    setNewRows([...newRows, newRow]); // Thêm dòng mới
  };
  // Lưu tất cả lịch trình
  const handleSaveAll = async () => {
    try {
      // Kiểm tra nếu thông tin lịch trình không đầy đủ
      if (
        newRows.some(
          (row) => !row.work || !row.workers || !row.datestart || !row.dateend
        )
      ) {
        throw new Error("Vui lòng điền đầy đủ thông tin lịch trình.");
      }

      // Kiểm tra định dạng ngày tháng
      const isValidDateFormat = (dateString) => {
        // Kiểm tra định dạng dd-mm-yyyy
        const regex = /^\d{2}-\d{2}-\d{4}$/;
        return regex.test(dateString);
      };

      // Kiểm tra từng dòng để đảm bảo định dạng ngày tháng
      newRows.forEach((row) => {
        if (!isValidDateFormat(row.datestart)) {
          throw new Error(
            `Ngày bắt đầu "${row.datestart}" không đúng định dạng dd-mm-yyyy.`
          );
        }
        if (!isValidDateFormat(row.dateend)) {
          throw new Error(
            `Ngày kết thúc "${row.dateend}" không đúng định dạng dd-mm-yyyy.`
          );
        }
        const [startDay, startMonth, startYear] = row.datestart
          .split("-")
          .map(Number);
        const [endDay, endMonth, endYear] = row.dateend.split("-").map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay);
        const endDate = new Date(endYear, endMonth - 1, endDay);

        if (endDate <= startDate) {
          throw new Error(
            `Ngày kết thúc "${row.dateend}" phải lớn hơn ngày bắt đầu "${row.datestart}".`
          );
        }
      });

      // Định dạng lại dữ liệu lịch trình trước khi lưu
      const formattedSchedules = newRows.map((row) => ({
        id: `sche-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`, // Tạo ID ngẫu nhiên cho mỗi dòng
        work: row.work,
        workers: row.workers,
        notes: row.notes,
        datestart: row.datestart,
        dateend: row.dateend,
        complete: row.complete,
        vehicle: row.vehicle,
        category: selectedCategory, // Lấy category từ dropdown
      }));

      // Gọi API từ context để thêm lịch trình
      await addSchedule(projectName, formattedSchedules, monitor, id);

      // Reset lại các trường nhập sau khi lưu thành công
      setNewRows([
        {
          work: "",
          workers: "",
          notes: "",
          datestart: "",
          dateend: "",
          complete: "",
          vehicle: "",
          category: "",
        },
      ]);
      setSuccessMessage("Lưu thành công tất cả lịch trình!");
      setErrorMessage("");

      // Gọi loadFilteredSchedules và truyền setSchedules
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage("");
    }
  };

  const handleEditRow = (schedule) => {
    console.log("Editing row with ID:", schedule.id);
    setEditingRowId(schedule.id);
    setOriginalRow({ ...schedule });
    setEditedRow({ ...schedule });
  };

  const handleUpdateRow = async () => {
    setIsUpdating(true);
    if (!editingRowId) {
      console.error("No editingRowId to update!");
      return;
    }

    const updatedFields = {};

    // Xây dựng các trường đã thay đổi
    if (editedRow.datestart !== originalRow.datestart) {
      updatedFields.datestart = editedRow.datestart;
    }
    if (editedRow.dateend !== originalRow.dateend) {
      updatedFields.dateend = editedRow.dateend;
    }
    if (editedRow.work !== originalRow.work) {
      updatedFields.work = editedRow.work;
    }
    if (editedRow.workers !== originalRow.workers) {
      updatedFields.workers = editedRow.workers;
    }
    if (editedRow.complete !== originalRow.complete) {
      updatedFields.complete = editedRow.complete;
    }
    if (editedRow.notes !== originalRow.notes) {
      updatedFields.notes = editedRow.notes;
    }

    // Kiểm tra xem có trường nào được cập nhật không
    if (Object.keys(updatedFields).length === 0) {
      console.log("No fields changed, no need to update.");
      return;
    }

    console.log("New data to update:", updatedFields);

    try {
      // Cập nhật dữ liệu trong Firestore
      await updateSchedule(editingRowId, updatedFields);
      // Reset state chỉ sau khi cập nhật thành công
      console.log("Update successful!");
      setEditingRowId(null);
      setEditedRow({
        datestart: "",
        dateend: "",
        work: "",
        workers: "",
        complete: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error updating:", error);
    }
    setIsUpdating(false);
  };

  // Trạng thái hiển thị trên di động
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const handleSaveEdit = async () => {
    if (!editingCategory) {
      console.error("Không có hạng mục nào để chỉnh sửa hoặc thêm.");
      return;
    }

    try {
      if (editingCategory.id) {
        // Chỉnh sửa hạng mục đã có
        await updateCategory(editingCategory.id, {
          label: editingCategory.label,
        });
      } else {
        // Thêm một hạng mục mới
        await addCategory(
          {
            value: editingCategory.value,
            label: editingCategory.label,
          },
          id
        );
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      await fetchCategories(id); // Tải lại danh sách sau khi lưu
    } catch (error) {
      console.error("Lỗi khi lưu hạng mục:", error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    await deleteCategory(categoryId);
    fetchCategories(id); // Tải lại danh sách sau khi xóa
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };
  const openModalForNewCategory = () => {
    setEditingCategory({ value: "", label: "" });
    setIsModalOpen(true);
  };
  const openModalForEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

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
          <div>
            <select
              onChange={handleChange}
              aria-label="Chọn hạng mục"
              style={{ width: "10%", height: "25px" }}
            >
              <option value="">Chọn hạng mục</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            &nbsp;&nbsp;&nbsp;
            <button
              onClick={openModalForNewCategory}
              style={styles.buttonmodal}
            >
              <img
                src={plus}
                alt="Xóa hạng mục"
                style={{ width: "15px", height: "15px" }}
              />
            </button>
            {isModalOpen && (
              <div style={styles.modal}>
                <h2 style={{ textAlign: "center" }}>
                  {editingCategory?.id
                    ? "Chỉnh sửa hạng mục"
                    : "Thêm hạng mục mới"}
                </h2>
                <input
                  type="text"
                  placeholder="Giá trị"
                  value={editingCategory?.value || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      value: e.target.value,
                    })
                  }
                  disabled={!!editingCategory?.id}
                />
                &nbsp;
                <input
                  type="text"
                  placeholder="Nhãn"
                  value={editingCategory?.label || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      label: e.target.value,
                    })
                  }
                />
                &nbsp;
                <button onClick={handleSaveEdit}>Lưu</button>&nbsp;
                <button onClick={handleModalClose}>Đóng</button>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Giá trị</th>
                      <th style={styles.th}>Nhãn</th>
                      <th style={styles.th}>Điều chỉnh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td style={styles.td}>{category.value}</td>
                        <td style={styles.td}>{category.label}</td>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                            width: "20%",
                          }}
                        >
                          <button
                            style={styles.buttonmodal}
                            onClick={() => openModalForEditCategory(category)}
                          >
                            <img
                              src={edits}
                              alt="Sửa hạng mục"
                              style={styles.img}
                            />
                          </button>
                          &nbsp;&nbsp;&nbsp;
                          <button
                            style={styles.buttonmodal}
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <img
                              src={remove}
                              alt="Xóa hạng mục"
                              style={styles.img}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          <table
            style={{
              marginTop: "10px",
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#fff",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
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
                <th style={{ padding: "10px", border: "1px solid #ccc" }}></th>
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
                                schedule.notes || ""
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px",
                                border: "1px solid #ccc",
                              }}
                            >
                              <Link
                                to={`/monitor-track-progress/${schedule.id}`}
                              >
                                <button style={styles.buttonmodal}>
                                  <img
                                    src={report}
                                    alt="Báo cáo tiến độ"
                                    style={styles.img}
                                  />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleEditRow(schedule)}
                                style={styles.buttonmodal}
                              >
                                <img
                                  src={edits}
                                  alt="Sửa lịch trình"
                                  style={styles.img}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  deleteSchedule(scheduleDoc.id, schedule.id)
                                }
                                style={styles.buttonmodal}
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
              {newRows.map((newRow, index) => (
                <tr key={newRow.id}>
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    {currentRowCount + index + 1}{" "}
                    {/* STT cố định cho dòng mới */}
                  </td>

                  {/* Input cho ngày bắt đầu và ngày kết thúc */}
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isMobileView ? "column" : "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={newRow.datestart}
                        onChange={(e) => {
                          const updatedRows = [...newRows];
                          updatedRows[index].datestart = e.target.value;
                          setNewRows(updatedRows);
                        }}
                        style={{
                          padding: "5px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          width: "50%",
                        }}
                      />
                      <p style={{ margin: "10px" }}>đến</p>
                      <input
                        type="text"
                        value={newRow.dateend}
                        onChange={(e) => {
                          const updatedRows = [...newRows];
                          updatedRows[index].dateend = e.target.value;
                          setNewRows(updatedRows);
                        }}
                        style={{
                          padding: "5px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                          width: "50%",
                        }}
                      />
                    </div>
                  </td>

                  {/* Các ô input khác giữ nguyên */}
                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <input
                      type="text"
                      value={newRow.work}
                      onChange={(e) => {
                        const updatedRows = [...newRows];
                        updatedRows[index].work = e.target.value;
                        setNewRows(updatedRows);
                      }}
                      style={{
                        width: "95%",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </td>

                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <input
                      type="text"
                      value={newRow.workers}
                      onChange={(e) => {
                        const updatedRows = [...newRows];
                        updatedRows[index].workers = e.target.value;
                        setNewRows(updatedRows);
                      }}
                      style={{
                        width: "90%",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </td>

                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <input
                      type="text"
                      value={newRow.vehicle}
                      onChange={(e) => {
                        const updatedRows = [...newRows];
                        updatedRows[index].vehicle = e.target.value;
                        setNewRows(updatedRows);
                      }}
                      style={{
                        width: "90%",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </td>

                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <input
                      type="text"
                      value={newRow.complete}
                      onChange={(e) => {
                        const updatedRows = [...newRows];
                        updatedRows[index].complete = e.target.value;
                        setNewRows(updatedRows);
                      }}
                      style={{
                        width: "95%",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </td>

                  <td style={{ padding: "10px", border: "1px solid #ccc" }}>
                    <input
                      type="text"
                      value={newRow.notes}
                      onChange={(e) => {
                        const updatedRows = [...newRows];
                        updatedRows[index].notes = e.target.value;
                        setNewRows(updatedRows);
                      }}
                      style={{
                        width: "95%",
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </td>

                  <td
                    style={{
                      paddingTop: "20px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={() => {
                        const updatedRows = newRows.filter(
                          (_, rowIndex) => rowIndex !== index
                        );
                        setNewRows(updatedRows);
                      }}
                      style={styles.buttonmodal}
                    >
                      <img src={remove} alt="Xóa dòng" style={styles.img} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handleAddRow}
              style={{
                marginRight: "10px",
                backgroundColor: "#3182ce",
                color: "white",
                padding: "10px 20px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Thêm dòng
            </button>
            <button
              onClick={handleSaveAll}
              style={{
                backgroundColor: "#38a169",
                color: "white",
                padding: "10px 20px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Lưu tất cả
            </button>
            &nbsp;&nbsp;&nbsp;
            {editingRowId && (
              <button
                onClick={handleUpdateRow}
                style={{
                  marginRight: "10px",
                  backgroundColor: isUpdating ? "#A0AEC0" : "#38A169", // Thay đổi màu nền khi đang cập nhật
                  color: "white",
                  padding: "10px 20px",
                  borderRadius: "5px",
                  border: "none",
                  cursor: isUpdating ? "not-allowed" : "pointer", // Thay đổi con trỏ chuột khi đang cập nhật
                  opacity: isUpdating ? 0.6 : 1, // Giảm độ mờ khi đang cập nhật
                }}
                disabled={isUpdating} // Vô hiệu hóa nút khi đang cập nhật
              >
                {isUpdating ? "Đang cập nhật..." : "Cập nhật"}{" "}
                {/* Thay đổi văn bản tùy theo trạng thái */}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
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
  table: {
    width: "100%",
    marginTop: "10px",
    borderCollapse: "collapse",
  },
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "center",
    backgroundColor: "#5961a3",
  },
  td: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
  },
  button: {
    padding: "5px 10px",
    margin: "0 5px",
    cursor: "pointer",
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
};
export default MonitorSchedules;
