import React, { useState, useEffect } from "react";
import { useUser } from "../components/UserContext"; // Giả sử bạn đã có UserContext để lấy thông tin người dùng
import { db, storage } from "../components/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Đảm bảo bạn đã import firestore và storage
import { doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import Sidebar from "../components/Sidebar";
import users from "../asset/user.png";
import Header from "../components/Header";

const Profile = () => {
  const { user } = useUser(); // Lấy thông tin người dùng từ context
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [email, setEmail] = useState(user?.email || "");
  const [image, setImage] = useState(user?.image || "");
  const [file, setFile] = useState(null); // State để lưu file ảnh tải lên
  const [loading, setLoading] = useState(false);

  // State cho mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false); // State để hiển thị form đổi mật khẩu

  // Hàm xử lý tải ảnh lên
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Cập nhật ảnh đại diện cho người dùng
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Hàm xử lý lưu thông tin người dùng
  const handleSave = async () => {
    setLoading(true);
    try {
      let downloadURL = image; // Khởi tạo biến downloadURL bằng với ảnh hiện tại
      if (file) {
        // Nếu có file, tải ảnh lên Firebase Storage
        const storageRef = ref(storage, `avatar/${user.email}.png`); // Sử dụng ref để tham chiếu đến file
        await uploadBytes(storageRef, file); // Tải file lên
        downloadURL = await getDownloadURL(storageRef); // Lấy URL tải xuống
      }

      // Tạo tham chiếu đến tài liệu người dùng
      const userDocRef = doc(db, "USERS", user.uid); // Tham chiếu đến tài liệu

      // Cập nhật thông tin cá nhân trong Firestore
      await setDoc(
        userDocRef,
        {
          image: downloadURL,
          fullname,
          email,
        },
        { merge: true }
      ); // Sử dụng merge: true để không xóa trường khác

      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin: ", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    const auth = getAuth();

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng nhập đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      // Lấy thông tin người dùng hiện tại
      const user = auth.currentUser;

      // Tạo credential để xác thực lại người dùng với mật khẩu cũ
      const credential = EmailAuthProvider.credential(user.email, oldPassword);

      // Thực hiện xác thực lại
      await reauthenticateWithCredential(user, credential);

      // Cập nhật mật khẩu trong Firebase Authentication
      await updatePassword(user, newPassword);

      // Cập nhật mật khẩu trong Firestore
      const userDocRef = doc(db, "USERS", user.uid); // Tham chiếu đến tài liệu người dùng
      await setDoc(userDocRef, { password: newPassword }, { merge: true }); // Cập nhật mật khẩu mới

      alert("Đổi mật khẩu thành công!");
      setShowPasswordChange(false); // Ẩn form đổi mật khẩu
      setOldPassword(""); // Reset mật khẩu cũ
      setNewPassword(""); // Reset mật khẩu mới
      setConfirmPassword(""); // Reset xác nhận mật khẩu mới
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu: ", error);
      alert("Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại!");
    }
  };

  useEffect(() => {
    if (user) {
      setFullname(user.fullname);
      setEmail(user.email);
      setImage(user.image);
    }
  }, [user]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <div style={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}>
        <Header />
        <div
          style={{
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <img
              src={image || users}
              alt="User Avatar"
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                marginRight: "20px",
                border: "2px solid #4CAF50", // Thêm viền cho ảnh đại diện
                objectFit: "cover", // Đảm bảo ảnh không bị méo
              }}
            />
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                cursor: "pointer",
                fontSize: "16px",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{ display: "block", marginBottom: "5px", color: "#555" }}
            >
              Họ tên:
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                style={{
                  marginLeft: "10px",
                  padding: "10px",
                  width: "50%",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "16px",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              />
            </label>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{ display: "block", marginBottom: "5px", color: "#555" }}
            >
              Email:
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  marginLeft: "10px",
                  padding: "10px",
                  width: "50%",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "16px",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              />
            </label>
          </div>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            disabled={loading}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
          >
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </button>

          <div style={{ marginTop: "30px" }}>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "16px",
                cursor: "pointer",
                transition: "background-color 0.3s",
              }}
            >
              {showPasswordChange ? "Hủy đổi mật khẩu" : "Đổi mật khẩu"}
            </button>

            {showPasswordChange && (
              <div style={{ marginTop: "15px" }}>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu cũ"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{
                    padding: "10px",
                    width: "50%",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "16px",
                    marginBottom: "10px",
                  }}
                />
                <input
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    padding: "10px",
                    width: "50%",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "16px",
                    marginBottom: "10px",
                  }}
                />
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    padding: "10px",
                    width: "50%",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    fontSize: "16px",
                    marginBottom: "10px",
                  }}
                />
                <button
                  onClick={handleChangePassword}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginLeft: "10px",
                  }}
                >
                  Lưu mật khẩu mới
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
