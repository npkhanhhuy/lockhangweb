import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm import useNavigate
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useAdvances } from '../../components/AdvanceContext';
import { auth, db } from '../../components/firebase'; // Firebase Auth và Firestore
import { getDoc, doc } from 'firebase/firestore';

const AddAdvance = () => {
    const {fetchAdvances, addAdvance } = useAdvances();
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [userName, setUserName] = useState('');
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    const navigate = useNavigate();

    useEffect(() => {
        if (userId) {
            fetchAdvances(userId);
            const fetchUserName = async () => {
                const userDocRef = doc(db, 'USERS', userId);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    console.log('User data:', userData); // Kiểm tra nội dung tài liệu
                    setUserName(userData.fullname || 'Người dùng');
                } else {
                    console.log('User document does not exist');
                }
            };
            fetchUserName();
        }
    }, [userId, fetchAdvances]);

     const handleAddAdvance = async () => {
        if (!amount || !reason) {
            alert('Vui lòng nhập đầy đủ thông tin.');
            return;
        }

        const newAdvance = {
            amount: parseFloat(amount),
            reason: reason,
            userName: userName,
            advanceId: userId,
        };

        await addAdvance(newAdvance.amount, newAdvance.reason, newAdvance.advanceId, newAdvance.userName);

        // Đặt lại giá trị input
        setAmount('');
        setReason('');

        // Điều hướng về trang MonitorAdvance sau khi thêm thành công
        navigate('/monitor-advance'); // Đảm bảo đường dẫn đúng
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <div style={{ flexGrow: 1 }}>
                <Header />
                <div style={styles.container}>
                    <h3 style={styles.title}>Ứng tiền</h3>
                    <div style={styles.addAdvanceContainer}>
                        <input
                            type="number"
                            placeholder="Số tiền (VNĐ)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={styles.inputField}
                        />
                        <input
                            type="text"
                            placeholder="Lý do"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            style={styles.inputField}
                        />
                        <button onClick={handleAddAdvance} style={styles.addButton}>Ứng tiền</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        backgroundColor: '#fff',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    title: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    addAdvanceContainer: {
        marginTop: '10px',
        border: '1px solid #ccc',
        padding: '20px',
        borderRadius: '5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px', // Thêm khoảng cách giữa các trường
    },
    inputField: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '100%', // Chiếm toàn bộ chiều rộng
        boxSizing: 'border-box', // Đảm bảo padding không làm tăng kích thước
    },
    addButton: {
        padding: '10px',
        backgroundColor: '#5961a3',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
};

export default AddAdvance;
