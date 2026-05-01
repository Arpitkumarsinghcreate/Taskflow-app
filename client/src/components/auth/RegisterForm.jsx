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

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['member', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const RegisterForm = ({ onTabSwitch }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'member',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');
    // Remove confirmPassword before sending
    const { confirmPassword, ...registerData } = data;
    try {
      const res = await authService.register(registerData);
      const { user, token } = res.data;
      setAuth(user, token);
      toast.success(`Account created! Welcome, ${user.firstName}`);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium text-[#f0f0f0] mb-1">Create account</h2>
      <p className="text-sm text-[#555] mb-6">Join your team on TaskFlow</p>

      {apiError && <ErrorBanner message={apiError} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-3">
          <FormField label="FIRST NAME" error={errors.firstName}>
            <input type="text" placeholder="Alex" {...register('firstName')} />
          </FormField>
          <FormField label="LAST NAME" error={errors.lastName}>
            <input type="text" placeholder="Morgan" {...register('lastName')} />
          </FormField>
        </div>

        <FormField label="EMAIL ADDRESS" error={errors.email}>
          <input type="email" placeholder="you@company.com" {...register('email')} />
        </FormField>

        <FormField label="PASSWORD" error={errors.password}>
          <input type="password" placeholder="••••••••" {...register('password')} />
        </FormField>

        <FormField label="CONFIRM PASSWORD" error={errors.confirmPassword}>
          <input type="password" placeholder="••••••••" {...register('confirmPassword')} />
        </FormField>

        <FormField label="YOUR ROLE" error={errors.role}>
          <select {...register('role')}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>

        <div className="mt-6">
          <SubmitButton isLoading={isLoading} text="Create account" />
        </div>
      </form>

      <p className="text-center text-xs text-[#444] mt-5">
        Already have an account?{' '}
        <span
          onClick={() => onTabSwitch('login')}
          className="text-[#1D9E75] cursor-pointer hover:underline"
        >
          Sign in
        </span>
      </p>
    </div>
  );
};

export default RegisterForm;
