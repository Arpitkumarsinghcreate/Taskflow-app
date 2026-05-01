import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  const features = [
    'Role-based access control',
    'Kanban board with drag & drop',
    'Real-time notifications',
    'Dashboard analytics',
  ];

  const tags = ['React', 'Node.js', 'MongoDB'];

  return (
    <div className="flex flex-row min-h-screen bg-[#0a0a0a]">
      {/* LEFT PANEL */}
      <div className="hidden md:flex w-[420px] bg-[#0f0f0f] border-r border-[#1e1e1e] flex-col p-10 justify-between">
        {/* TOP - Logo */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1D9E75]"></div>
          <span className="text-[#f0f0f0] text-base font-medium">TaskFlow</span>
        </div>

        {/* MIDDLE - Hero content */}
        <div>
          <h1 className="text-2xl font-medium text-[#f0f0f0] leading-snug mb-3 whitespace-pre-line">
            {'Manage projects.\nShip faster.'}
          </h1>
          <p className="text-sm text-[#555] leading-relaxed mb-8">
            A workspace for engineering teams to track tasks, assign work, and hit deadlines.
          </p>

          <div className="flex flex-col gap-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#1D9E75]"></div>
                <span className="text-xs text-[#444]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM - Tech tags + copyright */}
        <div>
          <div className="flex gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] text-[#333] border border-[#1e1e1e] rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#2a2a2a] mt-3">© 2025 TaskFlow</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* TAB TOGGLE */}
          <div className="flex bg-[#111] border border-[#1e1e1e] rounded-lg p-0.5 mb-8">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs rounded-md text-center cursor-pointer transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-[#1D9E75] text-white font-medium'
                  : 'text-[#555] hover:text-[#888]'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs rounded-md text-center cursor-pointer transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-[#1D9E75] text-white font-medium'
                  : 'text-[#555] hover:text-[#888]'
              }`}
            >
              Create account
            </button>
          </div>

          {activeTab === 'login' ? (
            <LoginForm onTabSwitch={setActiveTab} />
          ) : (
            <RegisterForm onTabSwitch={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
