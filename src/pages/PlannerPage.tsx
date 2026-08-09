import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Calendar, 
  Check, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Sidebar } from '../components/ui/Sidebar';
import { useStudyData } from '../hooks/useStudyData';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { PageTransition } from '../components/ui/PageTransition';
import { createTask, toggleTaskCompletion, deleteTask } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

export const PlannerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { tasks, loading, refetchData, handleCarryForwardTasks } = useStudyData();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [modalOpen, setModalOpen] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [carryingOver, setCarryingOver] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#15161F]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingState message="Opening Daily Planner..." />
        </main>
      </div>
    );
  }

  const dateTasks = tasks.filter((t) => t.targetDate === selectedDate);
  const completedCount = dateTasks.filter((t) => t.completed).length;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !taskDescription) return;

    try {
      setSubmitting(true);
      await createTask(currentUser.uid, {
        taskDescription,
        targetDate: selectedDate,
        completed: false,
      });
      setTaskDescription('');
      setModalOpen(false);
      refetchData();
    } catch (err) {
      console.error('Error creating task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (taskId: string, currentCompleted: boolean) => {
    if (!currentUser) return;
    await toggleTaskCompletion(currentUser.uid, taskId, !currentCompleted);
    refetchData();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentUser) return;
    await deleteTask(currentUser.uid, taskId);
    refetchData();
  };

  const handleCarryForward = async () => {
    setCarryingOver(true);
    const count = await handleCarryForwardTasks();
    setCarryingOver(false);
    if (count > 0) {
      alert(`Carried forward ${count} pending tasks to today!`);
    } else {
      alert('No pending tasks from previous days to carry forward.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#15161F] text-[#F5F5F2]">
      <Sidebar />

      <PageTransition className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343541] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#20212C] border border-[#343541] text-[11px] font-mono text-[#D8FF9A] mb-2">
              <CheckSquare className="w-3.5 h-3.5 text-[#D8FF9A]" />
              <span>DAILY PRODUCTIVITY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F2]">
              Daily Study Planner
            </h1>
            <p className="text-xs text-[#A7A7AD] mt-1">
              Create today's targets, track task execution, and carry forward pending study goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              icon={<RotateCcw className="w-4 h-4 text-[#D8FF9A]" />}
              onClick={handleCarryForward}
              disabled={carryingOver}
            >
              Carry Pending Tasks Forward
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setModalOpen(true)}
            >
              Add Target Task
            </Button>
          </div>
        </div>

        {/* DATE PICKER & STATS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1B1C26] p-4 rounded-xl border border-[#343541]">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-[#BFA7FF]" />
            <span className="text-xs font-mono text-[#A7A7AD] uppercase">Target Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#15161F] border border-[#343541] px-3 py-1.5 rounded text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
            />
            {selectedDate === todayStr && <Badge variant="lime">Today</Badge>}
          </div>

          <div className="text-xs font-mono text-[#A7A7AD] flex items-center gap-3">
            <span>Completed: <strong className="text-[#D8FF9A]">{completedCount}</strong> / {dateTasks.length}</span>
            <div className="w-24 bg-[#15161F] h-2 rounded-full overflow-hidden border border-[#343541]">
              <div
                className="bg-[#D8FF9A] h-full transition-all"
                style={{ width: `${dateTasks.length > 0 ? (completedCount / dateTasks.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* TASK LIST */}
        {dateTasks.length === 0 ? (
          <EmptyState
            title="NO TARGETS SET FOR THIS DATE"
            description="Break down your board preparation into bite-sized daily targets."
            actionText="Add Target Task"
            onAction={() => setModalOpen(true)}
            icon={<CheckSquare className="w-6 h-6" />}
          />
        ) : (
          <div className="space-y-3">
            {dateTasks.map((task) => (
              <Card
                key={task.id}
                className={`p-4 flex items-center justify-between gap-4 transition-all ${
                  task.completed ? 'bg-[#15161F]/40 border-[#343541]/50' : 'bg-[#1B1C26]'
                }`}
              >
                <div
                  className="flex items-center gap-3.5 flex-1 cursor-pointer"
                  onClick={() => handleToggle(task.id, task.completed)}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      task.completed
                        ? 'bg-[#D8FF9A] border-[#D8FF9A] text-[#15161F]'
                        : 'border-[#343541] bg-[#15161F]'
                    }`}
                  >
                    {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-medium transition-all ${
                      task.completed ? 'text-[#74747D] line-through' : 'text-[#F5F5F2]'
                    }`}
                  >
                    {task.taskDescription}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <Badge variant="lime">COMPLETED</Badge>
                  ) : (
                    <Badge variant="muted">PENDING</Badge>
                  )}

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded text-[#FF8F9A] hover:bg-[#FF8F9A]/10"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* CREATE TASK MODAL */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add Daily Study Target"
          subtitle={`Set a measurable goal for ${selectedDate}`}
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">
                Target Task Description
              </label>
              <input
                type="text"
                placeholder="e.g. Solve 15 Quadratic Equations, Revise Light Chapter 9..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A7A7AD] uppercase mb-1">Target Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#15161F] border border-[#343541] rounded-lg text-xs font-mono text-[#F5F5F2] focus:outline-none focus:border-[#BFA7FF]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#343541]">
              <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Target Task'}
              </Button>
            </div>
          </form>
        </Modal>

      </PageTransition>
    </div>
  );
};
