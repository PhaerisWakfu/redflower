import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import type { AppState, HistoryEntry, Kid } from '../lib/storage';

export function useAppData() {
    const [data, setDataState] = useState<AppState>(storage.getData());

    useEffect(() => {
        storage.checkAndRefreshDailyTasks();
        setDataState(storage.getData());
    }, []);

    const updateData = (newData: Partial<AppState>) => {
        const updated = { ...data, ...newData };
        setDataState(updated);
        storage.setData(updated);
    };

    const getKid = (kidId: string): Kid | undefined => {
        return data.kids.find((k) => k.id === kidId);
    };

    const updateKidData = (kidId: string, updater: (kid: Kid) => Kid) => {
        const newKids = data.kids.map((k) => (k.id === kidId ? updater(k) : k));
        updateData({ kids: newKids });
    };

    const addKid = (name: string, avatar: string) => {
        const kid: Kid = {
            id: Date.now().toString(),
            name,
            avatar,
            balance: 0,
            taskStatus: {},
            history: [],
        };
        updateData({ kids: [...data.kids, kid] });
        return kid.id;
    };

    const removeKid = (kidId: string) => {
        updateData({ kids: data.kids.filter((k) => k.id !== kidId) });
    };

    const updateKid = (kidId: string, updates: Partial<Pick<Kid, 'name' | 'avatar'>>) => {
        updateKidData(kidId, (kid) => ({ ...kid, ...updates }));
    };

    const completeTask = (kidId: string, taskId: string) => {
        const kid = getKid(kidId);
        if (!kid) return false;
        const task = data.tasks.find((t) => t.id === taskId);
        if (!task) return false;

        const status = kid.taskStatus[taskId];
        if (status?.completed) return false;

        const entry: HistoryEntry = {
            id: Date.now().toString(),
            date: Date.now(),
            amount: task.flowers,
            type: 'earn',
            description: `完成任务: ${task.title}`,
        };

        updateKidData(kidId, (k) => ({
            ...k,
            balance: k.balance + task.flowers,
            taskStatus: {
                ...k.taskStatus,
                [taskId]: { completed: true, completedAt: Date.now() },
            },
            history: [entry, ...k.history],
        }));
        return true;
    };

    const redeemReward = (kidId: string, rewardId: string) => {
        const kid = getKid(kidId);
        if (!kid) return false;
        const reward = data.rewards.find((r) => r.id === rewardId);
        if (!reward || kid.balance < reward.cost) return false;

        const entry: HistoryEntry = {
            id: Date.now().toString(),
            date: Date.now(),
            amount: reward.cost,
            type: 'spend',
            description: `兑换奖品: ${reward.title}`,
        };

        updateKidData(kidId, (k) => ({
            ...k,
            balance: k.balance - reward.cost,
            history: [entry, ...k.history],
        }));
        return true;
    };

    const manualAdjust = (kidId: string, amount: number, description: string = '家长手动调整') => {
        const kid = getKid(kidId);
        if (!kid) return false;

        const entry: HistoryEntry = {
            id: Date.now().toString(),
            date: Date.now(),
            amount: Math.abs(amount),
            type: amount > 0 ? 'earn' : 'spend',
            description,
        };

        updateKidData(kidId, (k) => ({
            ...k,
            balance: Math.max(0, k.balance + amount),
            history: [entry, ...k.history],
        }));
        return true;
    };

    const changePin = (newPin: string) => {
        updateData({ pin: newPin });
    };

    return {
        data,
        updateData,
        getKid,
        addKid,
        removeKid,
        updateKid,
        completeTask,
        redeemReward,
        manualAdjust,
        changePin,
    };
}
