import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const EditUser = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const { employees, loading, updateEmployee } = useUser(); // Thay đổi từ addEmployee thành updateEmployee
  const [editedUser, setEditedUser] = useState({
    id: '',
    fullname: '',
    email: '',
    phone: '',
    role: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Tìm kiếm nhân viên theo ID
    const currentEmployee = employees.find(emp => emp.id === id);
    if (currentEmployee) {
      setEditedUser({
        id: currentEmployee.id,
        fullname: currentEmployee.fullname,
        email: currentEmployee.email,
        phone: currentEmployee.phone,
        role: currentEmployee.role,
      });
    }
  }, [employees, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log('Đang cập nhật thông tin nhân viên:', editedUser); // Log thông tin để kiểm tra
    await updateEmployee(editedUser);
    navigate('/alluser');
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ flexGrow: 1, backgroundColor: '#d1d5db', minHeight: '100vh' }}>
        <Header />
        <div style={{ padding: '40px' }}>
          {editedUser.id ? ( // Kiểm tra xem có nhân viên đã được chỉnh sửa không
            <div style={styles.formContainer}>
              <label>
                Họ và tên:
                <input
                  type="text"
                  name="fullname"
                  value={editedUser.fullname}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <label>
                Số điện thoại:
                <input
                  type="text"
                  name="phone"
                  value={editedUser.phone}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </label>
              <label>
                Chức vụ:
                <select
                  name="role"
                  value={editedUser.role}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="manager">Lãnh đạo</option>
                  <option value="monitor">Giám sát</option>
                  <option value="materials">Vật tư</option>
                  <option value="file">Hồ sơ</option>
                  <option value="person">Nhân sự</option>
                </select>
              </label>
              <button onClick={handleSave} style={styles.saveButton}>
                Lưu
              </button>
              <Link to="/alluser">
                <button style={styles.cancelButton}>Hủy</button>
              </Link>
            </div>
          ) : (
            <p>Không tìm thấy nhân viên.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: {
    textAlign: 'center',
    color: '#000',
    fontSize: '24px',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px 40px 20px 25px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    color: '#fff',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  cancelButton: {
    backgroundColor: '#f87171',
    color: '#fff',
    padding: '10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
};

export default EditUser;
