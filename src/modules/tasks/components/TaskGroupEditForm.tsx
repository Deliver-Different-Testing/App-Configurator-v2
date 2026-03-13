import { useState } from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Toggle } from '../../../components/ui/Toggle';
import type {
  Task,
  TaskGroup,
  TaskGroupItem,
} from '../types';
import {
  formatOffset,
  getEffectiveOffset,
  getCategoryLabel,
} from '../types';

interface TaskGroupEditFormProps {
  taskGroup: TaskGroup;
  availableTasks: Task[];
  onSave: (taskGroup: TaskGroup) => void;
  onCancel: () => void;
}

// Sortable task item component
interface SortableTaskItemProps {
  item: TaskGroupItem;
  task?: Task;
  onRemove: () => void;
  onOffsetChange: (offset: number | undefined) => void;
  onNotesChange: (notes: string) => void;
}

function SortableTaskItem({
  item,
  task,
  onRemove,
  onOffsetChange,
  onNotesChange,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const effectiveOffset = getEffectiveOffset(item, task);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border border-border rounded-lg ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="cursor-grab text-text-muted hover:text-text-secondary touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Sequence Number */}
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-cyan/10 text-brand-cyan text-xs font-semibold">
        {item.sequenceIndex + 1}
      </div>

      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary truncate">
            {task?.name || 'Unknown Task'}
          </span>
          {task?.category && (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-text-secondary">
              {getCategoryLabel(task.category)}
            </span>
          )}
        </div>
        {item.notes && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{item.notes}</p>
        )}
      </div>

      {/* Offset Override Input */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-text-secondary whitespace-nowrap">Offset:</label>
        <input
          type="number"
          value={item.offsetMinutesOverride ?? ''}
          onChange={(e) =>
            onOffsetChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
          }
          placeholder={task?.defaultOffsetMinutes?.toString() || '—'}
          className="w-20 px-2 py-1 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
        />
        <span className="text-xs text-text-muted">
          ({formatOffset(effectiveOffset)})
        </span>
      </div>

      {/* Notes Toggle/Input */}
      <input
        type="text"
        value={item.notes || ''}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Notes..."
        className="w-32 px-2 py-1 text-sm border border-border rounded bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-cyan"
      />

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="text-text-muted hover:text-error transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function TaskGroupEditForm({
  taskGroup,
  availableTasks,
  onSave,
  onCancel,
}: TaskGroupEditFormProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: taskGroup.name,
    description: taskGroup.description || '',
    isActive: taskGroup.isActive,
    items: [...taskGroup.items],
  });

  // Task selector state
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = formData.items.findIndex((item) => item.id === active.id);
      const newIndex = formData.items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(formData.items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          sequenceIndex: index,
        })
      );

      setFormData((prev) => ({ ...prev, items: newItems }));
    }
  };

  // Handle adding a task
  const addTask = (task: Task) => {
    const newItem: TaskGroupItem = {
      id: `gi-${Date.now()}`,
      taskId: task.id,
      task: task,
      sequenceIndex: formData.items.length,
      offsetMinutesOverride: undefined,
      notes: undefined,
    };
    setFormData((prev) => ({ ...prev, items: [...prev.items, newItem] }));
    setShowTaskSelector(false);
    setTaskSearch('');
  };

  // Handle removing a task
  const removeTask = (itemId: string) => {
    const newItems = formData.items
      .filter((item) => item.id !== itemId)
      .map((item, index) => ({
        ...item,
        sequenceIndex: index,
      }));
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  // Handle offset change for an item
  const updateItemOffset = (itemId: string, offset: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, offsetMinutesOverride: offset } : item
      ),
    }));
  };

  // Handle notes change for an item
  const updateItemNotes = (itemId: string, notes: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, notes: notes || undefined } : item
      ),
    }));
  };

  // Filter tasks for selector
  const filteredTasks = availableTasks.filter((task) => {
    // Filter by search
    if (taskSearch) {
      const query = taskSearch.toLowerCase();
      return (
        task.name.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Handle save
  const handleSave = () => {
    const updatedGroup: TaskGroup = {
      ...taskGroup,
      name: formData.name,
      description: formData.description || undefined,
      isActive: formData.isActive,
      items: formData.items.map(({ task, ...item }) => item), // Remove resolved task references
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedGroup);
  };

  return (
    <div className="p-6 bg-surface-cream space-y-6">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-text-primary">Group Information</h4>

        <Input
          label="Group Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter group name..."
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe when this task group is used..."
            rows={2}
            className="w-full px-3.5 py-2.5 text-base border-2 border-border rounded-md bg-white text-text-primary placeholder:text-text-muted transition-all duration-normal focus:outline-none focus:border-brand-cyan focus:shadow-cyan-glow resize-y"
          />
        </div>
      </div>

      {/* Task Sequence Section */}
      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-text-primary">Task Sequence</h4>
            <p className="text-xs text-text-muted mt-0.5">
              Drag to reorder. Override offset per task if needed.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTaskSelector(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>

        {/* Task Selector Dropdown */}
        {showTaskSelector && (
          <div className="bg-white border border-border rounded-lg shadow-lg p-3 space-y-2">
            <Input
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => addTask(task)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-surface-cream rounded transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-text-primary">
                      {task.name}
                    </span>
                    {task.category && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-text-secondary">
                        {getCategoryLabel(task.category)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-text-muted">
                    {formatOffset(task.defaultOffsetMinutes)}
                  </span>
                </button>
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  No tasks found
                </p>
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowTaskSelector(false);
                  setTaskSearch('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Sortable Task List */}
        {formData.items.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={formData.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {formData.items.map((item) => (
                  <SortableTaskItem
                    key={item.id}
                    item={item}
                    task={item.task}
                    onRemove={() => removeTask(item.id)}
                    onOffsetChange={(offset) => updateItemOffset(item.id, offset)}
                    onNotesChange={(notes) => updateItemNotes(item.id, notes)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 bg-white border-2 border-dashed border-border rounded-lg">
            <p className="text-text-muted">No tasks in this group yet.</p>
            <p className="text-sm text-text-muted mt-1">
              Click "Add Task" to build your sequence.
            </p>
          </div>
        )}
      </div>

      {/* Status & Actions Section */}
      <div className="border-t border-border pt-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Toggle
            checked={formData.isActive}
            onChange={(checked) =>
              setFormData((prev) => ({ ...prev, isActive: checked }))
            }
            label={formData.isActive ? 'Active' : 'Inactive'}
          />
          <span className="text-xs text-text-muted">
            {formData.items.length} task{formData.items.length !== 1 ? 's' : ''} in sequence
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="save" size="sm" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
