import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from './firebase'; // Đảm bảo đúng đường dẫn tới firebase config
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [filers, setFilers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm lấy danh sách dự án từ Firestore
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'JOBS'));
      const projectData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectData);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi tải danh sách dự án: ', error);
      setError('Không thể tải danh sách dự án.');
      setLoading(false);
    }
  };

  // Hàm thêm dự án mới vào Firestore
  const uploadFile = async (file) => {
    if (!file) return null;
  
    const storageRef = ref(storage, `job_files/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
  
    // Trả về đối tượng chứa tên file và URL
    return {
      name: file.name,
      url: downloadURL,
    };
  };
  
  // Chỉnh sửa hàm addJob để hỗ trợ upload file
  const addJob = async (newJob) => {
    try {
      let fileURL = [];
      if (newJob.files && newJob.files.length > 0) {
        // Chỉ cần sử dụng selectedFiles được truyền từ AddJob
        const uploadPromises = newJob.files.map(file => uploadFile(file));
        fileURL = await Promise.all(uploadPromises);
      }
  
      await addDoc(collection(db, 'JOBS'), {
        name: newJob.name,
        description: newJob.description,
        monitor: newJob.monitor,
        filer: newJob.filer,
        volume: newJob.volume,
        datestart: newJob.datestart,
        dateend: newJob.dateend,
        notes: newJob.notes,
        persons: newJob.persons,
        vehicle: newJob.vehicle,
        file: fileURL || [],
        createdAt: formatDate(new Date()),
      });
      fetchProjects();
    } catch (error) {
      console.error('Lỗi khi thêm dự án: ', error);
      throw new Error('Lỗi khi thêm dự án');
    }
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
  // Hàm cập nhật dự án
  const updateJob = async (id, updatedJob) => {
    try {
      const existingJobRef = doc(db, 'JOBS', id);
      const existingJobSnapshot = await getDoc(existingJobRef);
      const existingJobData = existingJobSnapshot.data();
  
      // Lấy danh sách các file hiện tại
      let fileURL = existingJobData.file || [];
  
      // Lọc bỏ những file cần xóa
      if (updatedJob.filesToRemove && updatedJob.filesToRemove.length > 0) {
        fileURL = fileURL.filter(file => !updatedJob.filesToRemove.includes(file.name));
      }
  
      // Kiểm tra và thêm file mới nếu có
      if (updatedJob.file && updatedJob.file.length > 0) {
        const newFilesToAdd = updatedJob.file.filter(file => !fileURL.some(f => f.name === file.name));
  
        if (newFilesToAdd.length > 0) {
          const uploadPromises = newFilesToAdd.map(file => uploadFile(file));
          const newFileURLs = await Promise.all(uploadPromises);
          fileURL = [...fileURL, ...newFileURLs];
        }
      }
  
      // Cập nhật thông tin dự án
      await updateDoc(existingJobRef, {
        name: updatedJob.name,
        description: updatedJob.description,
        monitor: updatedJob.monitor,
        filer: updatedJob.filer,
        volume: updatedJob.volume,
        datestart: updatedJob.datestart,
        dateend: updatedJob.dateend,
        notes: updatedJob.notes,
        persons: updatedJob.persons,
        vehicle: updatedJob.vehicle,
        file: fileURL, // Lưu trữ danh sách file đã được lọc và thêm mới
        updatedAt: formatDate(new Date()),
      });
  
      fetchProjects(); // Cập nhật lại danh sách dự án sau khi hoàn tất cập nhật
    } catch (error) {
      console.error('Lỗi khi cập nhật dự án: ', error);
      throw new Error('Lỗi khi cập nhật dự án');
    }
  };
  
  
  // Hàm xóa dự án
  const deleteJob = async (id) => {
    try {
      await deleteDoc(doc(db, 'JOBS', id));
      fetchProjects(); // Cập nhật danh sách dự án sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa dự án: ', error);
      setError('Có lỗi xảy ra khi xóa dự án.');
    }
  };

  // Hàm lấy danh sách giám sát từ Firestore
  const fetchMonitors = async () => {
    try {
      const q = query(collection(db, 'USERS'), where('role', '==', 'monitor'));
      const querySnapshot = await getDocs(q);
      const supervisorList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullname: doc.data().fullname,
      }));
      setMonitors(supervisorList);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách giám sát: ', error);
      setError('Không thể tải danh sách giám sát.');
    }
  };

  // Hàm lấy danh sách nhân viên hồ sơ từ Firestore
  const fetchFilers = async () => {
    try {
      const q = query(collection(db, 'USERS'), where('role', '==', 'file'));
      const querySnapshot = await getDocs(q);
      const filerList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        fullname: doc.data().fullname,
      }));
      setFilers(filerList);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên hồ sơ: ', error);
      setError('Không thể tải danh sách nhân viên hồ sơ.');
    }
  };

  // Gọi các hàm lấy dữ liệu khi component mount
  useEffect(() => {
    fetchProjects();
    fetchMonitors();
    fetchFilers();
  }, []);

  return (
    <JobContext.Provider value={{ projects, addJob, updateJob, deleteJob, monitors, filers, loading, error }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => useContext(JobContext);
