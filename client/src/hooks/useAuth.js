import useAuthStore from '../store/authStore';

const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  return { user, token, isAuthenticated, setAuth, clearAuth };
};

export default useAuth;
