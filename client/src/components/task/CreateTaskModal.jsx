import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService';
import Modal from '../ui/Modal';
import FormField from '../auth/FormField';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['todo', 'in_progress', 'done', 'overdue']).default('todo'),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  tags: z.string().optional(),
});

const CreateTaskModal = ({ isOpen, onClose, projectId, projectMembers, onTaskCreated, defaultStatus }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: defaultStatus || 'todo',
    },
  });

  useEffect(() => {
    if (defaultStatus) {
      setValue('status', defaultStatus);
    }
  }, [defaultStatus, setValue]);

  const onSubmit = async (data) => {
    const tags = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter((t) => t !== '')
      : [];

    const payload = {
      ...data,
      tags,
      assignee: data.assignee || undefined,
    };

    try {
      await taskService.create(projectId, payload);
      toast.success('Task created!');
      onTaskCreated();
      reset();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="TITLE" error={errors.title}>
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            autoFocus 
            {...register('title')} 
          />
        </FormField>

        <FormField label="DESCRIPTION" error={errors.description}>
          <textarea
            rows="3"
            placeholder="Add some details..."
            className="resize-none"
            {...register('description')}
          ></textarea>
        </FormField>

        <div className="flex gap-3">
          <div className="flex-1">
            <FormField label="PRIORITY" error={errors.priority}>
              <select {...register('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>
          </div>
          <div className="flex-1">
            <FormField label="STATUS" error={errors.status}>
              <select {...register('status')}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
                <option value="overdue">Overdue</option>
              </select>
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="DUE DATE" error={errors.dueDate}>
            <input type="date" {...register('dueDate')} />
          </FormField>
          <FormField label="ASSIGNEE" error={errors.assignee}>
            <select {...register('assignee')}>
              <option value="">Unassigned</option>
              {projectMembers?.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.firstName} {member.user.lastName}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="TAGS" error={errors.tags}>
          <input 
            type="text" 
            placeholder="bug, frontend, urgent (comma separated)" 
            {...register('tags')} 
          />
        </FormField>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#555] hover:text-[#888] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#1D9E75] hover:bg-[#17875f] text-white text-xs px-6 py-2 rounded-md font-medium transition-colors"
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
