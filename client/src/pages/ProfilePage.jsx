import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { userService } from '../services/userService';
import FormField from '../components/auth/FormField';
import SubmitButton from '../components/auth/SubmitButton';
import StatusPill from '../components/ui/StatusPill';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data) => {
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile(data);
      setUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto py-2 flex flex-col gap-6">
      {/* PROFILE INFO CARD */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#1a3a2a] text-[#1D9E75] text-xl font-medium flex items-center justify-center border border-[#1e1e1e]">
            {user.firstName[0]}{user.lastName[0]}
          </div>
          <div>
            <h2 className="text-lg font-medium text-[#f0f0f0]">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-[#555]">{user.email}</p>
            <div className="mt-1">
              <StatusPill status={user.role} />
            </div>
          </div>
        </div>

        {user.createdAt && (
          <p className="text-xs text-[#444] mb-6">
            Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
          </p>
        )}

        <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
          <div className="flex gap-3">
            <FormField label="FIRST NAME" error={profileErrors.firstName}>
              <input type="text" {...registerProfile('firstName')} />
            </FormField>
            <FormField label="LAST NAME" error={profileErrors.lastName}>
              <input type="text" {...registerProfile('lastName')} />
            </FormField>
          </div>
          <SubmitButton text="Save changes" isLoading={savingProfile} />
        </form>
      </div>

      {/* CHANGE PASSWORD CARD */}
      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-6">
        <h3 className="text-sm font-medium text-[#f0f0f0] mb-4">Change Password</h3>
        
        <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
          <FormField label="CURRENT PASSWORD" error={passwordErrors.currentPassword}>
            <input type="password" placeholder="••••••••" {...registerPassword('currentPassword')} />
          </FormField>
          <FormField label="NEW PASSWORD" error={passwordErrors.newPassword}>
            <input type="password" placeholder="••••••••" {...registerPassword('newPassword')} />
          </FormField>
          <FormField label="CONFIRM NEW PASSWORD" error={passwordErrors.confirmPassword}>
            <input type="password" placeholder="••••••••" {...registerPassword('confirmPassword')} />
          </FormField>
          <SubmitButton text="Update password" isLoading={changingPassword} />
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
