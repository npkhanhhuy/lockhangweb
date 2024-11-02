import React, { createContext, useContext, useState, useCallback } from "react";
import { db } from "./firebase"; // Firebase config
import {
  updateDoc,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

// Tạo context
const MonitorJobContext = createContext();

export const MonitorJobProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [categories, setCategories] = useState([]); // State lưu trữ hạng mục
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading
  const [error, setError] = useState(null);

  const fetchSchedulesMonitor = async (fullname) => {
    try {
      const q = query(
        collection(db, "schedules"),
        where("createdBy", "==", fullname)
      );
      const querySnapshot = await getDocs(q);
      const scheduleData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSchedules(scheduleData); // Cập nhật danh sách lịch trình
    } catch (error) {
      console.error("Lỗi khi tải danh sách lịch trình: ", error);
      setError("Không thể tải danh sách lịch trình.");
    }
  };

  // Hàm lấy dữ liệu lịch trình từ Firestore
  const fetchSchedules = useCallback(async (categoryName) => {
    setLoading(true);
    try {
      const schedulesCollection = collection(db, "schedules");
      const schedulesSnapshot = await getDocs(schedulesCollection);

      if (!schedulesSnapshot.empty) {
        const fetchedSchedules = schedulesSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            const filteredSchedules = (data.schedules || []).filter(
              (schedule) => schedule.category === categoryName
            );

            return {
              id: doc.id,
              projectName: data.projectName,
              schedules: filteredSchedules,
            };
          })
          .filter((item) => item.schedules.length > 0);

        setSchedules(fetchedSchedules);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch trình:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const addSchedule = async (projectName, newSchedules, monitor, jobId) => {
    const scheduleData = {
      projectName,
      createdAt: formatDate(new Date()),
      createdBy: monitor,
      schedules: newSchedules,
      jobid: jobId,
    };

    try {
      const schedulesCollection = collection(db, "schedules");
      const scheduleDocRef = doc(schedulesCollection, jobId);
      const scheduleDocSnapshot = await getDoc(scheduleDocRef);

      if (!scheduleDocSnapshot.exists()) {
        await setDoc(scheduleDocRef, scheduleData);
        setSchedules((prevSchedules) => [
          ...prevSchedules,
          { id: jobId, schedules: newSchedules },
        ]);
      } else {
        const existingData = scheduleDocSnapshot.data();
        const updatedSchedules = [...existingData.schedules, ...newSchedules];
        await setDoc(scheduleDocRef, {
          ...existingData,
          schedules: updatedSchedules,
        });
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.id === jobId
              ? { ...schedule, schedules: updatedSchedules }
              : schedule
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi thêm lịch trình:", error);
    }
  };

  // Hàm xóa lịch trình
  const deleteSchedule = async (scheduleId, scheduleItemId) => {
    const scheduleDocRef = doc(db, "schedules", scheduleId);

    try {
      const docSnapshot = await getDoc(scheduleDocRef);

      if (docSnapshot.exists()) {
        const scheduleData = docSnapshot.data();
        // Lọc bỏ lịch trình dựa trên id của item
        const updatedSchedules = scheduleData.schedules.filter(
          (schedule) => schedule.id !== scheduleItemId
        );

        await setDoc(
          scheduleDocRef,
          { schedules: updatedSchedules },
          { merge: true }
        );
        setSchedules((prevSchedules) =>
          prevSchedules.map((schedule) =>
            schedule.id === scheduleId
              ? { ...schedule, schedules: updatedSchedules }
              : schedule
          )
        );
      } else {
        console.log("Document không tồn tại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa lịch trình:", error);
    }
  };

  const updateSchedule = async (scheduleId, updatedFields) => {
    console.log("Attempting to update schedule with ID:", scheduleId);

    if (typeof scheduleId !== "string" || !scheduleId) {
      console.error("Invalid scheduleId:", scheduleId);
      return;
    }

    if (Object.keys(updatedFields).length === 0) {
      console.error("No fields to update:", updatedFields);
      return;
    }

    // Kiểm tra sự tồn tại của tài liệu trước khi cập nhật
    const scheduleRef = doc(db, "schedules", scheduleId);

    try {
      const docSnap = await getDoc(scheduleRef);
      if (!docSnap.exists()) {
        console.error("No such document exists with ID:", scheduleId);
        return;
      }

      console.log(
        "Updating document with ID:",
        scheduleId,
        "and fields:",
        updatedFields
      );
      await updateDoc(scheduleRef, updatedFields);
      console.log("Document updated successfully!");

      setSchedules((prevSchedules) =>
        prevSchedules.map((schedule) => {
          return schedule.id === scheduleId
            ? { ...schedule, ...updatedFields }
            : schedule;
        })
      );
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const loadFilteredSchedules = async (category) => {
    try {
      const filteredSchedules = await fetchSchedules(category);
      setSchedules(filteredSchedules); // Cập nhật lịch trình
    } catch (error) {
      console.error("Lỗi khi tải lịch trình:", error);
    }
  };

  const fetchCategories = useCallback(
    async (jobId) => {
      if (!jobId) return; // Không thực hiện gì nếu jobId không có

      try {
        const categoriesCollection = collection(db, "categories");
        const q = query(categoriesCollection, where("jobId", "==", jobId));
        const categorySnapshot = await getDocs(q);

        console.log("Number of documents:", categorySnapshot.size);

        const categoriesList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          value: doc.data().value,
          label: doc.data().label,
        }));

        setCategories(categoriesList);
        console.log("Fetched Categories:", categoriesList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    },
    [setCategories]
  );

  // Hàm thêm hạng mục
  const addCategory = async (category, jobId) => {
    // Thêm tham số jobId
    try {
      const categoryData = {
        value: category.value, // Lưu giá trị
        label: category.label, // Lưu nhãn
        jobId: jobId, // Lưu ID của job
      };
      const categoryDocRef = doc(collection(db, "categories")); // Tạo document mới

      await setDoc(categoryDocRef, categoryData); // Lưu hạng mục vào Firestore

      // Cập nhật state với cả value, label và jobId
      setCategories((prevCategories) => [
        ...prevCategories,
        { id: categoryDocRef.id, ...categoryData },
      ]);
    } catch (error) {
      console.error("Lỗi khi thêm hạng mục:", error);
    }
  };

  // Hàm xóa hạng mục
  const deleteCategory = async (categoryId) => {
    try {
      // Lấy tên hạng mục từ bảng categories dựa trên categoryId
      const categoryDocRef = doc(db, "categories", categoryId);
      const categoryDoc = await getDoc(categoryDocRef);

      if (!categoryDoc.exists()) {
        console.error("Hạng mục không tồn tại.");
        return;
      }

      const categoryValue = categoryDoc.data().value; // Lấy giá trị của hạng mục

      // Kiểm tra xem categoryValue có hợp lệ không
      if (!categoryValue) {
        console.error("Giá trị hạng mục không hợp lệ:", categoryValue);
        return; // Ngừng thực hiện nếu giá trị hạng mục không hợp lệ
      }

      // Kiểm tra xem categoryValue có được sử dụng trong bảng schedules hay không
      const schedulesCollection = collection(db, "schedules");
      const q = query(
        schedulesCollection,
        where("schedules.category", "array-contains", categoryValue)
      ); // Sử dụng "array-contains"
      const scheduleSnapshot = await getDocs(q);

      // Kiểm tra xem có lịch trình nào sử dụng hạng mục này không
      if (scheduleSnapshot.size > 0) {
        console.error(
          "Hạng mục này đang được sử dụng trong các lịch trình và không thể xóa."
        );
        return; // Không xóa nếu hạng mục đang được sử dụng
      }

      // Nếu không có lịch trình nào sử dụng hạng mục này, tiến hành xóa
      await deleteDoc(categoryDocRef); // Xóa hạng mục khỏi Firestore
      setCategories((prevCategories) =>
        prevCategories.filter((cat) => cat.id !== categoryId)
      ); // Cập nhật state
      console.log("Đã xóa hạng mục:", categoryId);
    } catch (error) {
      console.error("Lỗi khi xóa hạng mục:", error);
    }
  };

  // Hàm cập nhật hạng mục
  const updateCategory = async (categoryId, updatedFields) => {
    try {
      // Kiểm tra nếu updatedFields không có trường để cập nhật, hãy thoát sớm
      if (Object.keys(updatedFields).length === 0) {
        console.error("Không có trường nào để cập nhật.");
        return;
      }

      const categoryDocRef = doc(db, "categories", categoryId);
      await updateDoc(categoryDocRef, updatedFields); // Cập nhật hạng mục trong Firestore

      // Cập nhật state cho categories
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, ...updatedFields } : cat
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật hạng mục:", error);
    }
  };

  return (
    <MonitorJobContext.Provider
      value={{
        schedules,
        loading,
        error,
        fetchSchedules,
        fetchSchedulesMonitor,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        categories,
        fetchCategories,
        addCategory,
        deleteCategory,
        updateCategory,
        loadFilteredSchedules,
      }}
    >
      {children}
    </MonitorJobContext.Provider>
  );
};

// Export hook useMonitorJobs để sử dụng trong các component khác
export const useMonitorJobs = () => useContext(MonitorJobContext);
