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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateGoal = (
    goal: { type: string; target: number },
    isEdit = false
  ) => {
    const validationErrors: Record<string, string> = {};

    if (goal.target <= 0) {
      validationErrors.target = 'Target must be greater than 0';
    }

    if (goal.type === 'time' && goal.target > 1440) {
      validationErrors.target =
        'Daily time target cannot exceed 24 hours (1440 minutes)';
    }

    if (goal.type === 'chars' && goal.target > 100000) {
      validationErrors.target =
        'Daily character target seems unreasonably high (max: 100,000)';
    }

    if (goal.type === 'episodes' && goal.target > 50) {
      validationErrors.target =
        'Daily episode target seems unreasonably high (max: 50)';
    }

    if (goal.type === 'pages' && goal.target > 500) {
      validationErrors.target =
        'Daily page target seems unreasonably high (max: 500)';
    }

    // Check for duplicate goal types when creating
    if (!isEdit) {
      const existingGoal = goals.find(
        (g) => g.type === goal.type && g.isActive
      );
      if (existingGoal) {
        validationErrors.duplicate = `You already have an active ${goalTypeConfig[goal.type as keyof typeof goalTypeConfig].label} goal`;
      }
    }

    return validationErrors;
  };

  const handleCreateGoal = () => {
    const validationErrors = validateGoal(newGoal);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.duplicate) {
        toast.error(validationErrors.duplicate);
      }
      return;
    }

    createGoal(newGoal);
  };

  const handleUpdateGoal = (goalId: string) => {
    if (editGoal.target !== undefined && editGoal.type) {
      const validationErrors = validateGoal(
        {
          type: editGoal.type,
          target: editGoal.target,
        },
        true
      );
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }
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
                      onChange={(e) => {
                        setNewGoal({
                          ...newGoal,
                          type: e.target.value as IDailyGoal['type'],
                        });
                        setErrors({});
                      }}
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
                      className={`input input-bordered w-full ${errors.target ? 'input-error' : ''}`}
                      value={newGoal.target}
                      onChange={(e) => {
                        setNewGoal({
                          ...newGoal,
                          target: Number(e.target.value),
                        });
                        setErrors({});
                      }}
                      placeholder="Enter target value"
                    />
                    {errors.target && (
                      <label className="label">
                        <span className="label-text-alt text-error flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {errors.target}
                        </span>
                      </label>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleCreateGoal}
                      disabled={
                        isCreatingGoal || Object.keys(errors).length > 0
                      }
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

        {/* Goals List with Enhanced Validation */}
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                          <div>
                            <select
                              className="select select-bordered select-sm w-full"
                              value={editGoal.type || goal.type}
                              onChange={(e) => {
                                setEditGoal({
                                  ...editGoal,
                                  type: e.target.value as IDailyGoal['type'],
                                });
                                setErrors({});
                              }}
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
                              className={`input input-bordered input-sm w-full ${
                                errors.target ? 'input-error' : ''
                              }`}
                              value={editGoal.target || goal.target}
                              onChange={(e) => {
                                setEditGoal({
                                  ...editGoal,
                                  target: Number(e.target.value),
                                });
                                setErrors({});
                              }}
                            />
                            {errors.target && (
                              <div className="text-xs text-error mt-1 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {errors.target}
                              </div>
                            )}
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
                              disabled={
                                isUpdatingGoal || Object.keys(errors).length > 0
                              }
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
