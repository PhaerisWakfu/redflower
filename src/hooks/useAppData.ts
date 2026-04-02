import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import type { AppState, HistoryEntry } from '../lib/storage';

export function useAppData() {
    const [data, setDataState] = useState<AppState>(storage.getData());

    useEffect(() => {
        // 页面加载时执行8点时间检查
        storage.checkAndRefreshDailyTasks();
        setDataState(storage.getData());
    }, []);

    const updateData = (newData: Partial<AppState>) => {
        const updated = { ...data, ...newData };
        setDataState(updated);
        storage.setData(updated);
    };

    const addHistory = (amount: number, type: 'earn' | 'spend', description: string, currentData: AppState) => {
        const entry: HistoryEntry = {
            id: Date.now().toString(),
            date: Date.now(),
            amount,
            type,
            description
        };
        return [entry, ...currentData.history];
    };

    const completeTask = (taskId: string) => {
        const taskIndex = data.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;
        const task = data.tasks[taskIndex];
        if (task.completed) return false;

        const updatedTasks = [...data.tasks];
        updatedTasks[taskIndex] = { ...task, completed: true, completedAt: Date.now() };

        updateData({
            tasks: updatedTasks,
            balance: data.balance + task.flowers,
            history: addHistory(task.flowers, 'earn', `完成任务: ${task.title}`, data)
        });
        return true;
    };

    const redeemReward = (rewardId: string) => {
        const reward = data.rewards.find(r => r.id === rewardId);
        if (!reward || data.balance < reward.cost) return false;

        updateData({
            balance: data.balance - reward.cost,
            history: addHistory(reward.cost, 'spend', `兑换奖品: ${reward.title}`, data)
        });
        return true;
    };

    return {
        data,
        updateData,
        completeTask,
        redeemReward
    };
}
