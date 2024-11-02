import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../components/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [employees, setEmployees] = useState([]); // Thêm state cho danh sách nhân viên
  const [loading, setLoading] = useState(true);   // State để theo dõi quá trình tải dữ liệu

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Lấy UID của người dùng hiện tại
          const userUID = await getUIDByEmail(currentUser.email);
          
          // Lấy thông tin người dùng từ Firestore (bảng USERS dựa trên UID)
          const userDocRef = doc(db, 'USERS', userUID);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData); // Lưu thông tin người dùng
            setRole(userData.role); // Lưu quyền của người dùng
          } else {
            console.error('Không có tài liệu người dùng!');
          }
        } catch (error) {
          console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
      } else {
        setUser(null);
        setRole(null); // Xóa quyền nếu người dùng đăng xuất
      }
      setLoading(false); // Ngừng loading sau khi lấy xong dữ liệu
    });

    return () => unsubscribe();
  }, []);

  // Hàm để lấy UID từ bảng emailToUID
  const getUIDByEmail = async (email) => {
    try {
      const emailDocRef = doc(db, 'emailToUID', email);
      const emailDoc = await getDoc(emailDocRef);
      if (emailDoc.exists()) {
        return emailDoc.data().uid; // Trả về UID từ bảng emailToUID
      } else {
        console.error(`Không tìm thấy UID cho email: ${email}`);
        return null;
      }
    } catch (error) {
      console.error('Lỗi khi lấy UID từ email:', error);
      return null;
    }
  };

  // Hàm để lấy danh sách nhân viên từ Firestore
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'USERS'));
        const employeeData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Sử dụng UID làm ID
          ...doc.data(),
        }));
        setEmployees(employeeData);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
      }
    }

    fetchEmployees();
  }, []);

  // Hàm thêm nhân viên
  const addEmployee = async (employee) => {
    try {
      // Tạo tài khoản trên Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, employee.email, employee.password);
      const { user } = userCredential;

      // Lưu thông tin nhân viên vào Firestore với UID làm ID
      const employeeData = {
        fullname: employee.fullname,
        email: employee.email,
        phone: employee.phone,
        password: employee.password,
        role: employee.role,
        uid: user.uid, // Lưu UID từ Firebase Auth
      };

      await setDoc(doc(db, 'USERS', user.uid), employeeData); // Sử dụng UID để lưu thông tin vào Firestore
      
      // Lưu email -> UID vào bảng phụ
      await setDoc(doc(db, 'emailToUID', employee.email), { uid: user.uid });

      setEmployees([...employees, { id: user.uid, ...employeeData }]); // Thêm nhân viên mới vào danh sách
    } catch (error) {
      console.error('Lỗi khi thêm nhân viên:', error);
    }
  };
  
  // Hàm cập nhật nhân viên
  const updateEmployee = async (employee) => {
    try {
      const employeeData = {
        fullname: employee.fullname,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
      };

      // Cập nhật thông tin vào Firestore dựa trên UID
      await setDoc(doc(db, 'USERS', employee.id), employeeData); 
      setEmployees(employees.map(emp => (emp.id === employee.id ? { id: employee.id, ...employeeData } : emp))); // Cập nhật danh sách nhân viên
    } catch (error) {
      console.error('Lỗi khi cập nhật nhân viên:', error);
    }
  };

  // Hàm xóa nhân viên
  const deleteEmployee = async (id) => {
    try {
      await deleteDoc(doc(db, 'USERS', id)); // Xóa nhân viên từ Firestore dựa trên UID
      setEmployees(employees.filter((employee) => employee.id !== id)); // Cập nhật lại danh sách nhân viên
    } catch (error) {
      console.error("Lỗi khi xóa nhân viên:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, role, employees, loading, addEmployee, deleteEmployee, updateEmployee }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
