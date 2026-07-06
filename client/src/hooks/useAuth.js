import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice.js';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return {
    user,
    token,
    loading,
    isLoggedIn: !!token,
    isCandidate: user?.role === 'candidate',
    isHR: user?.role === 'hr',
    isAdmin: user?.role === 'admin',
    handleLogout,
  };
}
