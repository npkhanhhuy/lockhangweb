import React, { createContext, useContext, useCallback, useState } from 'react';
import { db, auth,storage } from './firebase'; // Firebase config
import { updateDoc, doc, setDoc, getDoc, collection, getDocs, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Tạo context
const AdvanceContext = createContext();

export const AdvanceProvider = ({ children }) => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hàm lấy dữ liệu ứng tiền từ Firestore
  const fetchAdvances = useCallback(async (advanceId) => {
    setLoading(true);
    try {
      const advancesCollection = collection(db, 'advances');
      const advancesSnapshot = await getDocs(advancesCollection);

      if (!advancesSnapshot.empty) {
        const fetchedAdvances = advancesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            createdBy: data.createdBy, // Thêm thông tin người tạo
            advances: data.advances || [],
          };
        });
        setAdvances(fetchedAdvances);
      } else {
        setAdvances([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy ứng tiền:', error);
      setAdvances([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm lấy danh sách ứng tiền của giám sát
  const fetchSupervisorsAdvances = useCallback(async () => {
    setLoading(true);
    try {
        const advancesCollection = collection(db, 'advances');
        const advancesSnapshot = await getDocs(advancesCollection);

        if (!advancesSnapshot.empty) {
            const fetchedAdvances = advancesSnapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    createdBy: data.createdBy,
                    advances: data.advances || [], // Mảng các advance
                };
            });
            setAdvances(fetchedAdvances);
        } else {
            setAdvances([]);
        }
    } catch (error) {
        console.error('Lỗi khi lấy ứng tiền của giám sát:', error);
        setAdvances([]);
    } finally {
        setLoading(false);
    }
}, []);

const updateAdvanceStatus = async (advanceId, itemId) => {
    try {
        const advanceRef = doc(db, 'advances', advanceId);
        const advanceDoc = await getDoc(advanceRef);
        
        if (advanceDoc.exists()) {
            const advances = advanceDoc.data().advances;
            const updatedAdvances = advances.map(item => 
                item.id === itemId ? { ...item, status: 'Đã duyệt' } : item
            );
            await updateDoc(advanceRef, { advances: updatedAdvances });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái ứng tiền:', error);
    }
};

const rejectAdvance = async (advanceId, itemId) => {
    try {
        const advanceRef = doc(db, 'advances', advanceId);
        const advanceDoc = await getDoc(advanceRef);

        if (advanceDoc.exists()) {
            const advances = advanceDoc.data().advances;
            const updatedAdvances = advances.map(item => {
                // Kiểm tra nếu item.id khớp với itemId thì đổi status thành "Từ chối"
                if (item.id === itemId) {
                    return { ...item, status: 'Từ chối' }; // Cập nhật status
                }
                return item; // Trả về item không thay đổi
            });

            // Cập nhật lại toàn bộ danh sách advances
            await updateDoc(advanceRef, { advances: updatedAdvances });
        }
    } catch (error) {
        console.error('Lỗi khi từ chối ứng tiền:', error);
    }
};

const approveAdvance = async (advanceId, itemId) => {
    try {
        const advanceRef = doc(db, 'advances', advanceId); // Tham chiếu đến tài liệu advances
        const advanceDoc = await getDoc(advanceRef); // Lấy tài liệu advances

        if (advanceDoc.exists()) {
            const advances = advanceDoc.data().advances; // Lấy danh sách advances
            const updatedAdvances = advances.map(item => {
                // Kiểm tra nếu item.id khớp với itemId thì đổi status thành "Đã chuyển"
                if (item.id === itemId) {
                    return { ...item, status: 'Đã chuyển' }; // Cập nhật status
                }
                return item; // Trả về item không thay đổi
            });

            // Cập nhật lại toàn bộ danh sách advances trong Firestore
            await updateDoc(advanceRef, { advances: updatedAdvances });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái ứng tiền:', error); // In ra lỗi nếu có
    }
};

const addAdvance = async (amount, reason) => {
    const userId = auth.currentUser ? auth.currentUser.uid : null; // Lấy UID của người dùng hiện tại
    if (!userId) {
        console.error('Người dùng không đăng nhập');
        return;
    }

    const formattedDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    };

    // Tạo dữ liệu advanceData
    const advanceData = {
        id: `${userId}-${Date.now()}`, // Tạo id duy nhất cho mỗi advance dựa trên userId và thời gian
        date: formattedDate(new Date()),
        amount: amount,
        reason: reason,
        status: 'Đợi duyệt', // Trạng thái mặc định
        image: null, // Thêm trường image với giá trị null
    };

    try {
        // Lấy thông tin người dùng từ bảng USERS
        const userDocRef = doc(db, 'USERS', userId); // Giả sử bảng USERS có tên là 'users'
        const userDocSnapshot = await getDoc(userDocRef);

        let createdBy = 'Người dùng vô danh'; // Mặc định nếu không tìm thấy thông tin

        if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            createdBy = userData.fullname || 'Người dùng vô danh'; // Lấy fullName từ bảng USERS
        }

        const advancesCollection = collection(db, 'advances');
        const advanceDocRef = doc(advancesCollection, userId); // Sử dụng UID làm ID tài liệu
        const advanceDocSnapshot = await getDoc(advanceDocRef);

        if (!advanceDocSnapshot.exists()) {
            // Nếu tài liệu không tồn tại, thêm mới
            await setDoc(advanceDocRef, {
                createdBy: createdBy, // Sử dụng tên người dùng lấy được
                advances: [advanceData], // Khởi tạo mảng advances với advanceData
                advanceId: userId, // Sử dụng UID làm advanceId
            });
            setAdvances(prevAdvances => [...prevAdvances, { id: userId, advances: [advanceData] }]);
        } else {
            // Cập nhật tài liệu với các ứng tiền mới
            await updateDoc(advanceDocRef, {
                advances: arrayUnion(advanceData) // Thêm ứng tiền mới vào mảng
            });
            setAdvances(prevAdvances => prevAdvances.map(advance => 
                advance.id === userId ? { ...advance, advances: [...advance.advances, advanceData] } : advance
            ));
        }
    } catch (error) {
        console.error('Lỗi khi thêm ứng tiền:', error);
    }
};

  const deleteAdvance = async (advanceId, advanceToDeleteId) => {
    const advanceDocRef = doc(db, 'advances', advanceId);

    try {
      const docSnapshot = await getDoc(advanceDocRef);

      if (docSnapshot.exists()) {
        // Tìm mục cần xóa bằng advanceToDeleteId
        const advanceToDelete = docSnapshot.data().advances.find(advance => advance.id === advanceToDeleteId);

        if (advanceToDelete) {
          await updateDoc(advanceDocRef, {
            advances: arrayRemove(advanceToDelete) // Xóa mục khỏi mảng advances
          });

          // Cập nhật state
          setAdvances(prevAdvances => 
            prevAdvances.map(advance => 
              advance.id === advanceId 
                ? { 
                    ...advance, 
                    advances: advance.advances.filter(advance => advance.id !== advanceToDeleteId) // Lọc lại mảng
                  } 
                : advance
            )
          );
        } else {
          console.log("Mục cần xóa không tồn tại!");
        }
      } else {
        console.log("Document không tồn tại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa ứng tiền:", error);
    }
  };


// Hàm thêm ảnh vào một advance cụ thể
const addImageToAdvance = async (advanceId, itemId, imageFile) => {
    if (!imageFile) return;

    // Tạo một tham chiếu đến vị trí lưu trữ
    const imageRef = ref(storage, `advances/${advanceId}/${imageFile.name}`);

    try {
        // Tải lên ảnh lên Firebase Storage
        await uploadBytes(imageRef, imageFile);

        // Lấy URL của ảnh đã tải lên
        const imageUrl = await getDownloadURL(imageRef);

        // Lấy tài liệu hiện tại từ Firestore
        const advanceDocRef = doc(db, 'advances', advanceId);
        const advanceDocSnap = await getDoc(advanceDocRef);

        if (advanceDocSnap.exists()) {
            const advanceData = advanceDocSnap.data();

            // Tìm phần tử ứng tiền dựa trên trường id
            const index = advanceData.advances.findIndex(advance => advance.id === itemId); // Tìm chỉ số của phần tử cần cập nhật

            if (index !== -1) {
                // Cập nhật trường image của phần tử trong mảng mà không thay đổi các trường khác
                const updatedAdvance = {
                    ...advanceData.advances[index], // Lấy phần tử hiện tại
                    image: imageUrl // Cập nhật trường image với URL của ảnh
                };

                // Cập nhật Firestore
                const updatedAdvances = [
                    ...advanceData.advances.slice(0, index), // Các phần tử trước đó
                    updatedAdvance, // Phần tử đã cập nhật
                    ...advanceData.advances.slice(index + 1), // Các phần tử sau đó
                ];

                await updateDoc(advanceDocRef, {
                    advances: updatedAdvances // Cập nhật lại mảng advances
                });

                // Cập nhật lại danh sách ứng tiền để đồng bộ hóa
                fetchAdvances();
            } else {
                console.error("Không tìm thấy ứng tiền với ID:", itemId);
            }
        } else {
            console.error("No such document!");
        }
    } catch (error) {
        console.error("Error adding image to advance:", error);
    }
};

  return (
    <AdvanceContext.Provider value={{
         advances, loading, fetchAdvances, fetchSupervisorsAdvances, addAdvance, deleteAdvance, updateAdvanceStatus, rejectAdvance,
         approveAdvance, addImageToAdvance
         }}>
      {children}
    </AdvanceContext.Provider>
  );
};

// Export hook useAdvances để sử dụng trong các component khác
export const useAdvances = () => useContext(AdvanceContext);
