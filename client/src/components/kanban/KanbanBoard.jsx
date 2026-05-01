import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { MoreHorizontal, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { taskService } from '../../services/taskService';
import PriorityDot from '../ui/PriorityDot';
import CreateTaskModal from '../task/CreateTaskModal';
import TaskDetailModal from '../task/TaskDetailModal';

const KanbanBoard = ({ tasks, projectId, projectMembers, onTaskUpdate }) => {
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [createModalStatus, setCreateModalStatus] = useState(null);

  const columns = [
    { id: 'todo', label: 'To Do', color: '#555' },
    { id: 'in_progress', label: 'In Progress', color: '#185FA5' },
    { id: 'done', label: 'Done', color: '#1D9E75' },
    { id: 'overdue', label: 'Overdue', color: '#cc4444' },
  ];

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    const columnLabel = columns.find(c => c.id === newStatus)?.label;

    try {
      await taskService.update(draggableId, { status: newStatus });
      toast.success(`Task moved to ${columnLabel}`);
      onTaskUpdate();
    } catch (err) {
      toast.error('Failed to move task');
    }
  };

  const getColumnTasks = (status) => tasks.filter(t => t.status === status);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[280px] flex flex-col">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: column.color }}></div>
                <h3 className="text-sm font-medium text-[#888]">{column.label}</h3>
              </div>
              <span className="bg-[#1a1a1a] text-[#555] text-[10px] px-1.5 py-0.5 rounded font-medium">
                {getColumnTasks(column.id).length}
              </span>
            </div>

            {/* Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`flex-1 bg-[#0a0a0a] rounded-xl p-2 min-h-[400px] transition-colors border ${
                    snapshot.isDraggingOver ? 'border-dashed border-[#1D9E75] bg-[#0d1612]' : 'border-transparent'
                  }`}
                >
                  {getColumnTasks(column.id).map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => setSelectedTaskId(task._id)}
                          className={`bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:border-[#2e2e2e] transition-shadow ${
                            snapshot.isDragging ? 'shadow-2xl ring-1 ring-[#1D9E75]' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <PriorityDot priority={task.priority} />
                              <h4 className="text-sm text-[#e8e8e8] font-medium truncate">{task.title}</h4>
                            </div>
                            <button className="text-[#333] hover:text-[#555] shrink-0">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>

                          {task.tags?.length > 0 && (
                            <div className="flex gap-1 flex-wrap mb-3">
                              {task.tags.map((tag, i) => (
                                <span key={i} className="text-[9px] bg-[#1a1a1a] text-[#555] px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#1e1e1e]/50">
                            <div className={`flex items-center gap-1 text-[10px] ${
                              task.status === 'overdue' ? 'text-[#cc4444]' : 'text-[#444]'
                            }`}>
                              <Calendar size={10} />
                              {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                            </div>
                            
                            <div 
                              className="w-5 h-5 rounded-full bg-[#1a3a2a] text-[#1D9E75] text-[8px] font-medium flex items-center justify-center border border-[#0f0f0f]"
                              title={task.assignee?.fullName || 'Unassigned'}
                            >
                              {task.assignee 
                                ? `${task.assignee.firstName[0]}${task.assignee.lastName[0]}` 
                                : '?'}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {(column.id === 'todo' || column.id === 'in_progress') && (
              <button 
                onClick={() => setCreateModalStatus(column.id)}
                className="text-[11px] text-[#333] hover:text-[#1D9E75] transition-colors flex items-center gap-1 mt-2 px-2 py-1 w-full text-left"
              >
                <Plus size={12} />
                Add task
              </button>
            )}
          </div>
        ))}
      </div>

      <CreateTaskModal 
        isOpen={!!createModalStatus} 
        onClose={() => setCreateModalStatus(null)} 
        projectId={projectId} 
        projectMembers={projectMembers} 
        defaultStatus={createModalStatus} 
        onTaskCreated={onTaskUpdate} 
      />

      <TaskDetailModal 
        isOpen={!!selectedTaskId} 
        taskId={selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        projectMembers={projectMembers} 
        onTaskUpdated={onTaskUpdate} 
      />
    </DragDropContext>
  );
};

export default KanbanBoard;
