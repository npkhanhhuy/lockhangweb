import React, { createContext, useState, useContext, useCallback } from "react";
import { db } from "./firebase"; // Giả sử bạn đã cấu hình firebase
import {
  collection,
  getDocs,
  doc,
  setDoc,
  arrayUnion,
  updateDoc,
  getDoc,
} from "firebase/firestore";
// Tạo MonitorContext cho báo cáo
export const MonitorContext = createContext();

// Provider component
export const MonitorProvider = ({ children }) => {
  const [selectedReport, setSelectedReport] = useState([]);

  const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateToDDMMYYYY = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Định dạng dd-mm-yyyy
  };

  const generateReportForSchedule = useCallback(async (schedule) => {
    const { datestart, dateend, id } = schedule;

    if (!id) {
      console.error("Schedule ID is undefined or invalid.");
      return;
    }

    if (!datestart || !dateend) {
      console.error("Invalid datestart or dateend", datestart, dateend);
      return;
    }

    const startDate = parseDateString(datestart);
    const endDate = parseDateString(dateend);

    if (isNaN(startDate) || isNaN(endDate)) {
      console.error("Invalid date format for datestart or dateend");
      return;
    }

    const reportDocRef = doc(db, "report", id);

    try {
      const reportDoc = await getDoc(reportDocRef);
      const reportData = [];

      if (reportDoc.exists()) {
        const existingReports = reportDoc.data().reports || [];
        const existingDates = existingReports.map((report) => report.date);

        console.log("Existing dates:", existingDates);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= diffDays; i++) {
          const reportDate = new Date(startDate);
          reportDate.setDate(startDate.getDate() + i);

          const formattedDate = formatDateToDDMMYYYY(reportDate);
          if (!existingDates.includes(formattedDate)) {
            const reportId = `rp-${Math.random()
              .toString(36)
              .substr(2, 9)}-${formattedDate}`;
            const reportItem = {
              reportId,
              date: formattedDate,
              progress: `Thông tin tiến độ ${formattedDate}`,
            };
            reportData.push(reportItem);
          }
        }

        if (reportData.length > 0) {
          await setDoc(
            reportDocRef,
            {
              reports: arrayUnion(...reportData),
            },
            { merge: true }
          );

          console.log("Reports saved successfully!");
          // Tải lại dữ liệu báo cáo từ Firestore để cập nhật state
          const updatedDoc = await getDoc(reportDocRef);
          setSelectedReport(updatedDoc.data().reports || []);
        } else {
          console.log("All reports already exist for this schedule.");
          // Cập nhật state với dữ liệu hiện có
          setSelectedReport(existingReports);
        }
      } else {
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= diffDays; i++) {
          const reportDate = new Date(startDate);
          reportDate.setDate(startDate.getDate() + i);
          const formattedDate = formatDateToDDMMYYYY(reportDate);
          const reportId = `rp-${Math.random()
            .toString(36)
            .substr(2, 9)}-${formattedDate}`;
          const reportItem = {
            reportId,
            date: formattedDate,
          };
          reportData.push(reportItem);
        }

        await setDoc(reportDocRef, {
          scheduleId: id,
          reports: reportData,
        });

        console.log("Reports created and saved successfully for new schedule!");
        setSelectedReport(reportData);
      }
    } catch (error) {
      console.error("Error saving reports:", error);
    }
  }, []);

  const fetchScheduleAndGenerateReport = useCallback(
    async (scheduleId) => {
      try {
        const querySnapshot = await getDocs(collection(db, "schedules"));

        let foundSchedule = null;

        querySnapshot.forEach((doc) => {
          const scheduleData = doc.data();
          const { schedules } = scheduleData;

          const scheduleItem = schedules.find(
            (schedule) => schedule.id === scheduleId
          );

          if (scheduleItem) {
            foundSchedule = {
              ...scheduleItem,
              jobid: scheduleData.jobid,
              projectName: scheduleData.projectName,
            };
          }
        });

        if (foundSchedule) {
          console.log("Found Schedule:", foundSchedule);
          generateReportForSchedule(foundSchedule);
        } else {
          console.error("Schedule not found for the given scheduleId!");
        }
      } catch (error) {
        console.error("Error fetching schedules for report: ", error);
      }
    },
    [generateReportForSchedule] // Thêm generateReportForSchedule vào dependencies
  );

  const fetchReport = async (scheduleId, reportId) => {
    if (!scheduleId || !reportId) {
      console.error(
        "scheduleId hoặc reportId không hợp lệ:",
        scheduleId,
        reportId
      );
      return null;
    }

    try {
      const reportRef = doc(db, "report", scheduleId); // Lấy tài liệu theo scheduleId
      const reportSnap = await getDoc(reportRef);

      if (reportSnap.exists()) {
        const reportData = reportSnap.data();
        const reportsArray = reportData.reports || []; // Giả sử dữ liệu báo cáo nằm trong trường 'reports'

        // Tìm báo cáo dựa trên reportId
        const specificReport = reportsArray.find(
          (report) => report.reportId === reportId
        );

        if (specificReport) {
          console.log("Dữ liệu báo cáo:", specificReport);
          return specificReport; // Trả về dữ liệu của báo cáo cụ thể
        } else {
          console.error("Không tìm thấy báo cáo với reportId:", reportId);
          return null; // Nếu không tìm thấy báo cáo, trả về null
        }
      } else {
        console.error(
          "Không tìm thấy tài liệu báo cáo với scheduleId:",
          scheduleId
        );
        return null; // Nếu không tìm thấy tài liệu, trả về null
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi lấy dữ liệu báo cáo:", error);
      return null; // Trả về null nếu có lỗi
    }
  };

  const addReportForDay = async (scheduleId, reportId, newFields) => {
    try {
      if (!scheduleId || !reportId) {
        console.error(
          "scheduleId hoặc reportId không hợp lệ:",
          scheduleId,
          reportId
        );
        return;
      }

      const scheduleRef = doc(db, "report", scheduleId);
      const scheduleSnap = await getDoc(scheduleRef);

      if (!scheduleSnap.exists()) {
        console.error("Tài liệu không tồn tại:", scheduleId);
        return;
      }

      const scheduleData = scheduleSnap.data();
      const reports = scheduleData.reports || [];

      // Tìm và cập nhật phần tử trong mảng `reports`
      let updatedReports = reports.map((report) => {
        if (report.reportId === reportId) {
          return { ...report, ...newFields }; // Cập nhật các trường mới
        }
        return report; // Giữ nguyên các phần tử khác
      });

      console.log("Mảng reports trước khi cập nhật:", reports);
      console.log("Mảng reports sau khi cập nhật:", updatedReports);

      if (JSON.stringify(reports) !== JSON.stringify(updatedReports)) {
        await updateDoc(scheduleRef, { reports: updatedReports });
        console.log("Báo cáo đã được cập nhật thành công!");
      } else {
        console.log("Không có thay đổi nào để cập nhật.");
      }

      // Xác minh thay đổi
      const updatedScheduleSnap = await getDoc(scheduleRef);
      console.log("Dữ liệu sau khi cập nhật:", updatedScheduleSnap.data());
    } catch (error) {
      console.error("Có lỗi xảy ra khi cập nhật báo cáo:", error);
    }
  };

  const updateReportById = async (reportId, newFields) => {
    try {
      const reportDocRef = doc(db, "report", reportId);
      await updateDoc(reportDocRef, newFields);
    } catch (error) {
      console.error("Error updating report:", error);
      throw error; // Ném lỗi ra ngoài để xử lý ở nơi gọi
    }
  };

  return (
    <MonitorContext.Provider
      value={{
        selectedReport,
        fetchScheduleAndGenerateReport,
        addReportForDay,
        updateReportById,
        fetchReport,
      }}
    >
      {children}
    </MonitorContext.Provider>
  );
};

export const useMonitor = () => {
  return useContext(MonitorContext);
};
