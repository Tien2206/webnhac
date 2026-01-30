import { HashRouter, Routes, Route } from 'react-router-dom';
import UserApp from './user/UserApp';
import AdminDashboard from './admin/page/AdminDashboard';
const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<UserApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<UserApp />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
