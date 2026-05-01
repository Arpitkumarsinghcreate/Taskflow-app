import { useState, useEffect } from 'react';
import { Plus, UserMinus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../../services/projectService';
import api from '../../services/api';
import Modal from '../ui/Modal';

const MembersPanel = ({ project, currentUser, onUpdate }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = project.owner._id === currentUser?._id;

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      // Filter out users who are already members
      const memberIds = project.members.map(m => m.user._id);
      const filtered = res.data.data.filter(u => !memberIds.includes(u._id));
      setAvailableUsers(filtered);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    if (isAddModalOpen) fetchUsers();
  }, [isAddModalOpen]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      await projectService.addMember(project._id, { userId: selectedUserId, role: selectedRole });
      toast.success('Member added to project');
      setIsAddModalOpen(false);
      onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await projectService.removeMember(project._id, userId);
      toast.success('Member removed');
      onUpdate();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await projectService.updateMemberRole(project._id, userId, { role: newRole });
      toast.success('Role updated');
      onUpdate();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[#f0f0f0]">Project Members ({project.members.length})</h2>
        {isOwner && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1D9E75] hover:bg-[#17875f] text-white text-[11px] px-3 py-1.5 rounded-md transition-colors flex items-center gap-2"
          >
            <Plus size={12} />
            Add Member
          </button>
        )}
      </div>

      <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-[#1e1e1e] bg-[#111]">
              <th className="py-3 px-4 text-[10px] font-medium text-[#555] tracking-widest uppercase">MEMBER</th>
              <th className="py-3 px-4 text-[10px] font-medium text-[#555] tracking-widest uppercase">ROLE</th>
              <th className="py-3 px-4 text-[10px] font-medium text-[#555] tracking-widest uppercase">JOINED</th>
              {isOwner && <th className="py-3 px-4 text-[10px] font-medium text-[#555] tracking-widest uppercase text-right">ACTIONS</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]/50">
            {project.members.map((member) => (
              <tr key={member.user._id} className="hover:bg-[#111]/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1a3a2a] text-[#1D9E75] flex items-center justify-center text-xs font-medium">
                      {member.user.firstName[0]}{member.user.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm text-[#e8e8e8] font-medium">{member.user.fullName}</p>
                      <p className="text-[11px] text-[#444]">{member.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {isOwner && member.user._id !== project.owner._id ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                      className="bg-transparent text-xs text-[#888] outline-none cursor-pointer focus:text-[#1D9E75]"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#888] capitalize">{member.role}</span>
                      {member.role === 'admin' && <Shield size={10} className="text-[#1D9E75]" />}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-[#444]">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </td>
                {isOwner && (
                  <td className="py-3 px-4 text-right">
                    {member.user._id !== project.owner._id && (
                      <button
                        onClick={() => handleRemoveMember(member.user._id)}
                        className="text-[#333] hover:text-[#cc4444] transition-colors"
                        title="Remove member"
                      >
                        <UserMinus size={14} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MEMBER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Project Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">SELECT USER</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-[#1e1e1e] rounded-md text-sm text-[#e8e8e8] outline-none focus:border-[#1D9E75]"
              required
            >
              <option value="">Select a user...</option>
              {availableUsers.map(user => (
                <option key={user._id} value={user._id}>{user.email} ({user.fullName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[#555] tracking-widest mb-1.5 uppercase">PROJECT ROLE</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-[#1e1e1e] rounded-md text-sm text-[#e8e8e8] outline-none focus:border-[#1D9E75]"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="text-xs text-[#555] hover:text-[#888]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#1D9E75] hover:bg-[#17875f] text-white text-xs px-6 py-2 rounded-md font-medium"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembersPanel;
