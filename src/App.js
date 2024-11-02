// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./components/UserContext";
import { JobProvider } from "./components/JobContext";
import { MonitorJobProvider } from "./components/MonitorJobContext";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header"; // Nếu bạn có Header component
import Materials from "./pages/Materials";
import Advance from "./pages/Advance";
import Timekeeping from "./pages/Timekeeping";
import Job from "./pages/Job";
import AllUser from "./pages/AllUser";
import AddUser from "./pages/AddUser";
import AdminDashboard from "./pages/AdminDashboard";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import MonitorJob from "./pages/monitor/MonitorJob";
import DetailJob from "./pages/monitor/DetailJob";
import EditUser from "./pages/EditUser";
import MonitorSchedules from "./pages/monitor/MonitorSchedules";
import FileJob from "./pages/file/FileJob";
import ListSchedules from "./pages/monitor/ListSchedules";
import MonitorAdvance from "./pages/monitor/MonitorAdvance";
import { AdvanceProvider } from "./components/AdvanceContext";
import AddAdvance from "./pages/monitor/AddAdvance";
import ListAdvance from "./pages/accountant/ListAdvance";
import Schedules from "./pages/Schedules";
import FileDetailJob from "./pages/file/FileDetailJob";
import FilerSchedules from "./pages/file/FilerSchedules";
import Profile from "./pages/Profile";
import ManangerSchedule from "./pages/ManangerSchedule";
import Trackprogress from "./pages/Trackprogress";
import MonitorTrackProgress from "./pages/monitor/MonitorTrackProgress";
import MonitorMaterials from "./pages/monitor/MonitorMaterials";
import { MonitorProvider } from "./components/MonitorContext";
import ReportDetail from "./pages/monitor/ReportDetail";
import ListTrackProgress from "./pages/monitor/ListTrackProgress";

function App() {
  const isAuthenticated = localStorage.getItem("user") !== null; // Kiểm tra trạng thái đăng nhập

  return (
    <UserProvider>
      <JobProvider>
        <MonitorJobProvider>
          <AdvanceProvider>
            <MonitorProvider>
              <Router>
                <div style={{ display: "flex" }}>
                  {/* Hiển thị Header và Sidebar khi đã đăng nhập */}
                  {isAuthenticated && <Sidebar />}
                  <div style={{ flexGrow: 1 }}>
                    {isAuthenticated && <Header />}
                    <Routes>
                      {/* Chuyển hướng người dùng đến trang login nếu chưa đăng nhập */}
                      {/* ADMIN */}
                      <Route
                        path="*"
                        element={
                          isAuthenticated ? <Navigate to="/login" /> : <Login />
                        }
                      />
                      <Route
                        path="/dashboard"
                        element={
                          isAuthenticated ? (
                            <Navigate to="/login" />
                          ) : (
                            <AdminDashboard />
                          )
                        }
                      />
                      <Route
                        path="/track-progress"
                        element={<Trackprogress />}
                      />
                      <Route path="/schedules" element={<Schedules />} />
                      <Route
                        path="/mananger-schedule/:id"
                        element={<ManangerSchedule />}
                      />
                      <Route path="/alluser" element={<AllUser />} />
                      <Route path="/adduser" element={<AddUser />} />
                      <Route path="/edit-user/:id" element={<EditUser />} />
                      <Route path="/materials" element={<Materials />} />
                      <Route path="/advance" element={<Advance />} />
                      <Route path="/timekeeping" element={<Timekeeping />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/profile/:id" element={<Profile />} />
                      {/* JOB */}
                      <Route path="/job" element={<Job />} />
                      <Route path="/add-job" element={<AddJob />} />
                      <Route path="/edit-job/:id" element={<EditJob />} />

                      {/* MONITOR */}
                      <Route path="/monitor-job" element={<MonitorJob />} />
                      <Route
                        path="/list-monitor-schedules"
                        element={<ListSchedules />}
                      />
                      <Route
                        path="/monitor-schedules/:id"
                        element={<MonitorSchedules />}
                      />
                      <Route path="/detail-job/:id" element={<DetailJob />} />
                      <Route
                        path="/monitor-advance"
                        element={<MonitorAdvance />}
                      />
                      <Route
                        path="/monitor-materials"
                        element={<MonitorMaterials />}
                      />
                      <Route
                        path="/list-monitor-track-progress"
                        element={<ListTrackProgress />}
                      />
                      <Route
                        path="/monitor-track-progress/:scheduleId"
                        element={<MonitorTrackProgress />}
                      />
                      <Route
                        path="/report-detail/:scheduleId/:reportId"
                        element={<ReportDetail />}
                      />
                      <Route path="/add-advance" element={<AddAdvance />} />

                      {/* FILE */}
                      <Route path="/filer-job" element={<FileJob />} />
                      <Route
                        path="/filer-detail-job/:id"
                        element={<FileDetailJob />}
                      />
                      <Route
                        path="/filer-schedules/:id"
                        element={<FilerSchedules />}
                      />
                      {/* ACCOUNTANT */}
                      <Route path="/list-advance" element={<ListAdvance />} />
                      {/* Thêm các routes khác */}
                      <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                  </div>
                </div>
              </Router>
            </MonitorProvider>
          </AdvanceProvider>
        </MonitorJobProvider>
      </JobProvider>
    </UserProvider>
  );
}

export default App;
