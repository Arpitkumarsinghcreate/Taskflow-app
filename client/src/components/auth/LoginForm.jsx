import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import useAuth from '../../hooks/useAuth';
import FormField from './FormField';
import SubmitButton from './SubmitButton';
import ErrorBanner from './ErrorBanner';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginForm = ({ onTabSwitch }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await authService.login(data);
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium text-[#f0f0f0] mb-1">Welcome back</h2>
      <p className="text-sm text-[#555] mb-6">Sign in to your workspace</p>

      {apiError && <ErrorBanner message={apiError} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField label="EMAIL ADDRESS" error={errors.email}>
          <input type="email" placeholder="you@company.com" {...register('email')} />
        </FormField>

        <FormField label="PASSWORD" error={errors.password}>
          <div className="relative">
            <input type="password" placeholder="••••••••" {...register('password')} />
            <div className="absolute right-0 -bottom-5">
              <span className="text-[10px] text-[#1D9E75] cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>
          </div>
        </FormField>

        <div className="mt-8">
          <SubmitButton isLoading={isLoading} text="Sign in" />
        </div>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-[#1e1e1e]"></div>
        <span className="text-[11px] text-[#333]">or</span>
        <div className="flex-1 h-px bg-[#1e1e1e]"></div>
      </div>

      <button className="w-full py-2.5 bg-[#111] border border-[#1e1e1e] rounded-md flex items-center justify-center gap-2 text-[#555] text-xs hover:border-[#2e2e2e] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <p className="text-center text-xs text-[#444] mt-5">
        No account?{' '}
        <span
          onClick={() => onTabSwitch('register')}
          className="text-[#1D9E75] cursor-pointer hover:underline"
        >
          Create one
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
