import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import {
  createDailyGoalFn,
  deleteDailyGoalFn,
  updateDailyGoalFn,
} from '../api/trackerApi';
import { IDailyGoal } from '../types';
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdSave,
  MdCancel,
  MdSchedule,
  MdBook,
  MdPlayArrow,
  MdPages,
  MdClose,
} from 'react-icons/md';

const goalTypeConfig = {
  time: {
    label: 'Time (minutes)',
    icon: MdSchedule,
    color: 'text-primary',
    unit: 'min',
  },
  chars: {
    label: 'Characters',
    icon: MdBook,
    color: 'text-secondary',
    unit: 'chars',
  },
  episodes: {
    label: 'Episodes',
    icon: MdPlayArrow,
    color: 'text-accent',
    unit: 'ep',
  },
  pages: {
    label: 'Pages',
    icon: MdPages,
    color: 'text-info',
    unit: 'pages',
  },
};

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: IDailyGoal[];
}

function GoalsModal({ isOpen, onClose, goals }: GoalsModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<
    Omit<IDailyGoal, '_id' | 'createdAt' | 'updatedAt'>
  >({
    type: 'time',
    target: 30,
    isActive: true,
  });
  const [editGoal, setEditGoal] = useState<Partial<IDailyGoal>>({});

  const queryClient = useQueryClient();

  const { mutate: createGoal, isPending: isCreatingGoal } = useMutation({
    mutationFn: createDailyGoalFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyGoals'] });
      toast.success('Daily goal created successfully!');
      setIsCreating(false);
      setNewGoal({ type: 'time', target: 30, isActive: true });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.message
          : 'An error occurred';
      toast.error(errorMessage);
    },
  });

  const { mutate: updateGoal, isPending: isUpdatingGoal } = useMutation({
    mutationFn: ({
      goalId,
      goal,
    }: {
      goalId: string;
      goal: Partial<IDailyGoal>;
    }) => updateDailyGoalFn(goalId, goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyGoals'] });
      toast.success('Daily goal updated successfully!');
      setEditingGoal(null);
      setEditGoal({});
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.message
          : 'An error occurred';
      toast.error(errorMessage);
    },
  });

  const { mutate: deleteGoal, isPending: isDeletingGoal } = useMutation({
    mutationFn: deleteDailyGoalFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyGoals'] });
      toast.success('Daily goal deleted successfully!');
    },
    onError: (error) => {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data.message
          : 'An error occurred';
      toast.error(errorMessage);
    },
  });

  const handleCreateGoal = () => {
    if (newGoal.target <= 0) {
      toast.error('Target must be greater than 0');
      return;
    }
    createGoal(newGoal);
  };

  const handleUpdateGoal = (goalId: string) => {
    if (editGoal.target && editGoal.target <= 0) {
      toast.error('Target must be greater than 0');
      return;
    }
    updateGoal({ goalId, goal: editGoal });
  };

  const startEdit = (goal: IDailyGoal) => {
    setEditingGoal(goal._id!);
    setEditGoal({
      type: goal.type,
      target: goal.target,
      isActive: goal.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingGoal(null);
    setEditGoal({});
  };

  const formatProgress = (value: number, type: IDailyGoal['type']) => {
    if (type === 'chars') {
      return value.toLocaleString();
    }
    return value.toString();
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Daily Goals</h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Create Goal Form */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create New Goal</h3>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="btn btn-primary btn-sm"
            >
              <MdAdd className="w-4 h-4" />
              {isCreating ? 'Cancel' : 'Add Goal'}
            </button>
          </div>

          {isCreating && (
            <div className="card bg-base-200 shadow-sm">
              <div className="card-body p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Goal Type</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={newGoal.type}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          type: e.target.value as IDailyGoal['type'],
                        })
                      }
                    >
                      {Object.entries(goalTypeConfig).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Target</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="input input-bordered w-full"
                      value={newGoal.target}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          target: Number(e.target.value),
                        })
                      }
                      placeholder="Enter target value"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateGoal}
                      disabled={isCreatingGoal}
                      className="btn btn-primary w-full"
                    >
                      {isCreatingGoal ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <MdSave className="w-4 h-4" />
                          Create
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Goals</h3>
          {goals.length === 0 ? (
            <div className="alert alert-info">
              <MdBook className="w-6 h-6" />
              <span>
                No daily goals set. Create your first goal to start tracking
                your progress!
              </span>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {goals.map((goal) => {
                const config = goalTypeConfig[goal.type];
                const Icon = config.icon;
                const isEditing = editingGoal === goal._id;

                return (
                  <div
                    key={goal._id}
                    className={`card bg-base-200 shadow-sm ${
                      !goal.isActive ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="card-body p-4">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div>
                            <select
                              className="select select-bordered select-sm w-full"
                              value={editGoal.type || goal.type}
                              onChange={(e) =>
                                setEditGoal({
                                  ...editGoal,
                                  type: e.target.value as IDailyGoal['type'],
                                })
                              }
                            >
                              {Object.entries(goalTypeConfig).map(
                                ([key, config]) => (
                                  <option key={key} value={key}>
                                    {config.label}
                                  </option>
                                )
                              )}
                            </select>
                          </div>
                          <div>
                            <input
                              type="number"
                              min="1"
                              className="input input-bordered input-sm w-full"
                              value={editGoal.target || goal.target}
                              onChange={(e) =>
                                setEditGoal({
                                  ...editGoal,
                                  target: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-2">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={editGoal.isActive ?? goal.isActive}
                                onChange={(e) =>
                                  setEditGoal({
                                    ...editGoal,
                                    isActive: e.target.checked,
                                  })
                                }
                              />
                              <span className="label-text">Active</span>
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateGoal(goal._id!)}
                              disabled={isUpdatingGoal}
                              className="btn btn-primary btn-sm"
                            >
                              <MdSave className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="btn btn-ghost btn-sm"
                              disabled={isUpdatingGoal}
                            >
                              <MdCancel className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-6 h-6 ${config.color}`} />
                            <div>
                              <h4 className="font-semibold">{config.label}</h4>
                              <p className="text-sm text-base-content/70">
                                Target: {formatProgress(goal.target, goal.type)}{' '}
                                {config.unit}
                                {!goal.isActive && ' (Inactive)'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(goal)}
                              className="btn btn-ghost btn-sm"
                            >
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteGoal(goal._id!)}
                              disabled={isDeletingGoal}
                              className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}

export default GoalsModal;
