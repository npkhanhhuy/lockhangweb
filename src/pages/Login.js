import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from "../components/firebase"; // db từ Firestore
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Firestore functions
import '../styles/Login.css';
import logo from '../asset/logo.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        localStorage.setItem('user', JSON.stringify(userDoc.data()));
        console.log("Thông tin người dùng đã lưu:", userDoc.data());
      }
      
      navigate('/dashboard');
      console.log("Chuyển hướng đến dashboard");
    } catch (error) {
      console.log(error.message);
      setError("Thông tin đăng nhập không đúng");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div>
        <img src={logo} alt="Logo" style={{ width: '250px' }} />
        </div>
        <h2>Đăng nhập</h2>
        <form onSubmit={handleLogin} className="login-form">
          {error && <p className="error-message">{error}</p>}
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Đăng nhập</button>
          <Link to='/ForgotPass'>
            <p>Quên mật khẩu ?</p>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default Login;
