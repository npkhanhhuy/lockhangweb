// Sidebar.js
import React, { useState, useEffect } from "react";
import { IconButton, CircularProgress } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../components/firebase";
import { useUser } from "../components/UserContext";

import logo from "../asset/logo.png";
import back from "../asset/back.png";
import homeIcon from "../asset/home.png";
import eventIcon from "../asset/event.png";
import contactbookIcon from "../asset/contact-book.png";
import carrepairIcon from "../asset/car-repair.png";
import creditcardIcon from "../asset/credit-card.png";
import logout from "../asset/logout.png";
import users from "../asset/user.png";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      // Giả sử bạn có logic nào đó để kiểm tra khi nào dữ liệu user sẵn sàng
      setLoading(false); // Khi dữ liệu sẵn sàng, tắt trạng thái loading
    }
  }, [user]);

  const getRoleLabel = (role) => {
    switch (role) {
      case "manange":
        return "Lãnh đạo";
      case "monitor":
        return "Giám sát";
      case "accountant":
        return "Kế toán";
      case "materials":
        return "Vật tư";
      case "file":
        return "Hồ sơ";
      default:
        return "Chưa xác định";
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      localStorage.removeItem("user");
      navigate("/login");
    });
  };

  // Menu items cho từng role
  const manangeMenuItems = [
    { text: "Quản lý các dự án", to: "/job", icon: homeIcon },
    { text: "Quản lý nhân viên", to: "/alluser", icon: contactbookIcon },
    { text: "Quản lý lịch trình", to: "/schedules", icon: eventIcon },
    { text: "Quản lý chấm công nhân sự", to: "/timekeeping", icon: homeIcon },
    { text: "Quản lý vật tư, cơ giới", to: "/materials", icon: carrepairIcon },
    { text: "Quản lý ứng tiền", to: "/advance", icon: creditcardIcon },
  ];

  const monitorMenuItems = [
    { text: "Quản lý dự án", to: "/monitor-job", icon: homeIcon },
    {
      text: "Quản lý lịch trình",
      to: "/list-monitor-schedules",
      icon: contactbookIcon,
    },
    {
      text: "Theo dõi, báo cáo tiến độ",
      to: "/list-monitor-track-progress",
      icon: creditcardIcon,
    },
    {
      text: "Quản lý vật tư, cơ giới",
      to: "/monitor-materials",
      icon: carrepairIcon,
    },
    { text: "Quản lý ứng tiền", to: "/monitor-advance", icon: creditcardIcon },
  ];

  const fileMenuItems = [
    { text: "Quản lý dự án", to: "/filer-job", icon: homeIcon },
    {
      text: "Theo dõi, báo cáo tiến độ",
      to: "/file-report",
      icon: creditcardIcon,
    },
  ];

  const personMenuItems = [
    { text: "Quản lý nhân sự", to: "/person-dashboard", icon: homeIcon },
    { text: "Quản lý chấm công", to: "/person-report", icon: creditcardIcon },
    { text: "Quản lý lương", to: "/person-employees", icon: contactbookIcon },
  ];

  const materialMenuItems = [
    {
      text: "Quản lý vật tư, cơ giới",
      to: "/material-dashboard",
      icon: homeIcon,
    },
  ];

  const accountantMenuItems = [
    { text: "Quản lý ứng tiền", to: "/list-advance", icon: homeIcon },
  ];
  // Chọn menu dựa trên quyền của người dùng
  let menuItems;
  if (user?.role === "manange") {
    menuItems = manangeMenuItems;
  } else if (user?.role === "monitor") {
    menuItems = monitorMenuItems;
  } else if (user?.role === "file") {
    menuItems = fileMenuItems;
  } else if (user?.role === "person") {
    menuItems = personMenuItems;
  } else if (user?.role === "material") {
    menuItems = materialMenuItems;
  } else if (user?.role === "accountant") {
    menuItems = accountantMenuItems;
  } else {
    menuItems = []; // Nếu không có quyền xác định
  }

  return (
    <div>
      <div
        style={{
          width: isOpen ? "250px" : "60px",
          height: "100%",
          background: "#ABB7D8",
          color: "white",
          transition: "width 0.3s ease",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Toggle */}
        {isOpen ? (
          <IconButton
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: "50%",
              right: "-30px",
              transform: "translateY(-50%)",
              backgroundColor: "#ABB7D8",
              color: "white",
              borderRadius: "50%",
              boxShadow: "0 0 10px rgba(0,0,0,0.5)",
              zIndex: 1,
            }}
          >
            <img
              src={back}
              alt={isOpen ? "Close" : "Open"}
              style={{ width: "24px", height: "24px", color: "white" }}
            />
          </IconButton>
        ) : (
          <IconButton
            onClick={toggleSidebar}
            style={{
              position: "absolute",
              top: "10px",
              left: "7px",
              color: "black",
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo and User Info */}
        {isOpen && (
          <div style={{ textAlign: "center", borderBottom: "2px solid black" }}>
            <Link to="/dashboard">
              <img
                src={logo}
                alt="Logo"
                style={{
                  width: "250px",
                  transition: "width 0.3s ease",
                  borderBottom: "2px solid black",
                }}
              />
            </Link>
            {loading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100px", // Đặt chiều cao cố định để tránh thay đổi kích thước
                }}
              >
                <CircularProgress />
              </div>
            ) : (
              user && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "10px",
                    padding: "10px",
                    minHeight: "100px", // Đặt chiều cao tối thiểu để cố định kích thước
                  }}
                >
                  <img
                    src={user.image || users}
                    alt="User Avatar"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      marginRight: "20px",
                    }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <p
                      style={{
                        margin: "0",
                        color: "black",
                        fontWeight: "bold",
                      }}
                    >
                      Xin chào {user.fullname}
                    </p>
                    <p
                      style={{
                        margin: "0",
                        color: "black",
                        fontWeight: "bold",
                      }}
                    >
                      {user.email}
                    </p>
                    <p
                      style={{
                        margin: "0",
                        color: "black",
                        fontWeight: "bold",
                      }}
                    >
                      {getRoleLabel(user.role)}
                    </p>
                    <Link
                      to={`/profile/${user.uid}`}
                      style={{ textDecoration: "none", color: "black" }}
                    >
                      <button
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "blue",
                        }}
                      >
                        Thông tin cá nhân
                      </button>
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* Menu Items */}
        <div style={{ padding: "20px", height: "50vh" }}>
          {menuItems.map((item, index) => (
            <Link
              to={item.to}
              key={index}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                padding: "10px",
                marginBottom: "5px",
                borderRadius: "25px",
                cursor: "pointer",
                borderBottom: "1px solid #444",
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateX(0)" : "translateX(-20px)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                visibility: isOpen ? "visible" : "hidden",
                backgroundColor:
                  location.pathname === item.to ? "#2F58CA" : "#93A3D0",
                color: location.pathname === item.to ? "white" : "black",
              }}
            >
              <img
                src={item.icon}
                alt={item.text}
                style={{ width: "24px", marginRight: "10px" }}
              />
              {isOpen && <span style={{ fontSize: "12px" }}>{item.text}</span>}
            </Link>
          ))}
        </div>

        {/* Logout */}
        {isOpen && (
          <div
            style={{
              textAlign: "right",
              marginTop: "auto",
              borderTop: "2px solid black",
            }}
          >
            <IconButton onClick={handleLogout}>
              <img src={logout} alt="Đăng xuất" style={{ width: "20px" }} />
              <span style={{ marginLeft: 5, color: "black", fontSize: "15px" }}>
                Đăng xuất
              </span>
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
