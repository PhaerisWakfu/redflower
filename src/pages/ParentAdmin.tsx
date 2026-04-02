import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { Task, Reward } from '../lib/storage';
import { ArrowLeft, Plus, Trash2, Flower } from 'lucide-react';
import './ParentAdmin.css';

interface Props {
    onBack: () => void;
}

export const ParentAdmin: React.FC<Props> = ({ onBack }) => {
    const { data, updateData } = useAppData();
    const [activeTab, setActiveTab] = useState<'tasks' | 'rewards'>('tasks');

    // Forms
    const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', flowers: 1, type: 'daily' });
    const [newReward, setNewReward] = useState<Partial<Reward>>({ title: '', cost: 5, emoji: '🎁' });

    const addTask = () => {
        if (!newTask.title) return;
        const task: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            flowers: newTask.flowers || 1,
            type: newTask.type as 'daily' | 'one-time',
            completed: false
        };
        updateData({ tasks: [...data.tasks, task] });
        setNewTask({ title: '', flowers: 1, type: 'daily' });
    };

    const removeTask = (id: string) => {
        updateData({ tasks: data.tasks.filter(t => t.id !== id) });
    };

    const addReward = () => {
        if (!newReward.title) return;
        const reward: Reward = {
            id: Date.now().toString(),
            title: newReward.title,
            cost: newReward.cost || 5,
            emoji: newReward.emoji || '🎁'
        };
        updateData({ rewards: [...data.rewards, reward] });
        setNewReward({ title: '', cost: 5, emoji: '🎁' });
    };

    const removeReward = (id: string) => {
        updateData({ rewards: data.rewards.filter(r => r.id !== id) });
    };

    const manualAdjust = () => {
        const amountStr = prompt('直接增加或减少小红花数量（如果想要扣除请填负数，如 -5）：');
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (!isNaN(amount) && amount !== 0) {
            updateData({
                balance: Math.max(0, data.balance + amount),
                history: [{
                    id: Date.now().toString(),
                    date: Date.now(),
                    amount: Math.abs(amount),
                    type: amount > 0 ? 'earn' : 'spend',
                    description: '家长手动调整'
                }, ...data.history]
            });
        }
    };

    const handleResetData = () => {
        if (window.confirm('⚠️ 危险警告：这会彻底清空你们积攒的所有小红花余额、做过的任务流、以及设定的奖品。系统将恢复到初始出厂状态！\n\n确定要继续此极具破坏性的操作吗？')) {
            if (window.confirm('一旦按确定，所有数据灰飞烟灭。妈妈准备好了吗？')) {
                localStorage.removeItem('redflower_data');
                window.location.reload();
            }
        }
    };

    return (
        <div className="parent-admin animate-slide-up">
            <header className="admin-header glass-panel">
                <button className="btn-secondary icon-btn" onClick={onBack}>
                    <ArrowLeft size={20} /> 返回主页
                </button>
                <h2>家长管理面板</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" onClick={manualAdjust}>手动调账</button>
                    <button className="btn-danger" onClick={handleResetData}>全站重置</button>
                </div>
            </header>

            <div className="admin-tabs">
                <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>任务管理</button>
                <button className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>奖品管理</button>
            </div>

            <div className="admin-content glass-panel">
                {activeTab === 'tasks' && (
                    <div className="admin-section">
                        <div className="add-form">
                            <input type="text" placeholder="任务名称 (例如：练琴半小时)" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                            <input type="number" placeholder="奖励朵数" value={newTask.flowers} onChange={e => setNewTask({ ...newTask, flowers: parseInt(e.target.value) || 0 })} />
                            <select value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value as any })}>
                                <option value="daily">每日固定</option>
                                <option value="one-time">一次性惊喜</option>
                            </select>
                            <button className="btn-primary form-btn" onClick={addTask}><Plus size={18} />添加</button>
                        </div>
                        <div className="list-view">
                            {data.tasks.map(t => (
                                <div key={t.id} className="list-item">
                                    <div className="item-info">
                                        <strong>{t.title}</strong>
                                        <span className="badge">
                                            {t.type === 'daily' ? '每天' : '一次'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                                            <span>+{t.flowers}</span>
                                            <Flower size={14} color="#c96b5e" fill="#e8a99f" />
                                        </div>
                                    </div>
                                    <button className="btn-danger icon-btn" onClick={() => removeTask(t.id)}><Trash2 size={16} /></button>
                                </div>
                            ))}
                            {data.tasks.length === 0 && <p className="text-muted">还没有任务，快添加一个吧！</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'rewards' && (
                    <div className="admin-section">
                        <div className="add-form">
                            <input type="text" placeholder="图标 Emoji" style={{ width: '90px', flex: 'none' }} value={newReward.emoji} onChange={e => setNewReward({ ...newReward, emoji: e.target.value })} />
                            <input type="text" placeholder="奖品名称 (例如：一次游乐园)" value={newReward.title} onChange={e => setNewReward({ ...newReward, title: e.target.value })} />
                            <input type="number" placeholder="花费朵数" value={newReward.cost} onChange={e => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 0 })} />
                            <button className="btn-primary form-btn" onClick={addReward}><Plus size={18} />添加</button>
                        </div>
                        <div className="list-view">
                            {data.rewards.map(r => (
                                <div key={r.id} className="list-item">
                                    <div className="item-info">
                                        <span style={{ fontSize: '1.1rem' }}>{r.emoji}</span>
                                        <strong>{r.title}</strong>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                                            <span>{r.cost}</span>
                                            <Flower size={14} color="#c96b5e" fill="#e8a99f" />
                                        </div>
                                    </div>
                                    <button className="btn-danger icon-btn" onClick={() => removeReward(r.id)}><Trash2 size={16} /></button>
                                </div>
                            ))}
                            {data.rewards.length === 0 && <p className="text-muted">还没设置奖品哦</p>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
