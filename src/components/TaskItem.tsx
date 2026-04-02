import React from 'react';
import type { Task } from '../lib/storage';
import { CheckCircle, Circle, Flower } from 'lucide-react';
import './TaskItem.css';

interface TaskItemProps {
    task: Task;
    onComplete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete }) => {
    return (
        <div
            className={`task-item glass-panel ${task.completed ? 'completed' : ''}`}
            onClick={() => {
                if (!task.completed) onComplete(task.id);
            }}
        >
            <div className="task-icon">
                {task.completed ? (
                    <CheckCircle className="text-success animate-pop" size={24} color="#6a8f82" />
                ) : (
                    <Circle className="text-muted" size={24} color="#c8bfb6" />
                )}
            </div>

            <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                <span className="task-badge">
                    {task.type === 'daily' ? '每天' : '一次性'}
                </span>
            </div>

            <div className="task-reward">
                <span className="flower-count">+{task.flowers}</span>
                <Flower size={16} color="#c96b5e" className="flower-icon" fill="#e8a99f" />
            </div>
        </div>
    );
}
