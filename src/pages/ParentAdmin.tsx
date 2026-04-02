import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import type { Task, Reward } from '../lib/storage';
import { ArrowLeft, Plus, Trash2, Flower, Pencil, Lock } from 'lucide-react';
import './ParentAdmin.css';

interface Props {
    onBack: () => void;
}

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🦊', '🐰', '🐻', '🌟', '🦄', '🐼'];

export const ParentAdmin: React.FC<Props> = ({ onBack }) => {
    const { data, updateData, addKid, removeKid, updateKid, manualAdjust, changePin } = useAppData();
    const [activeTab, setActiveTab] = useState<'kids' | 'tasks' | 'rewards'>('kids');

    // PIN change
    const [showPinDialog, setShowPinDialog] = useState(false);
    const [oldPin, setOldPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [pinMsg, setPinMsg] = useState('');

    // Forms
    const [newTask, setNewTask] = useState<Partial<Task>>({ title: '', flowers: 1, type: 'daily' });
    const [newReward, setNewReward] = useState<Partial<Reward>>({ title: '', cost: 5, emoji: '🎁' });

    // Kid management
    const [showAddKid, setShowAddKid] = useState(false);
    const [newKidName, setNewKidName] = useState('');
    const [newKidAvatar, setNewKidAvatar] = useState('👦');
    const [editingKidId, setEditingKidId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('');

    const addTask = () => {
        if (!newTask.title) return;
        const task: Task = {
            id: Date.now().toString(),
            title: newTask.title,
            flowers: newTask.flowers || 1,
            type: newTask.type as 'daily' | 'one-time',
        };
        updateData({ tasks: [...data.tasks, task] });
        setNewTask({ title: '', flowers: 1, type: 'daily' });
    };

    const removeTask = (id: string) => {
        updateData({ tasks: data.tasks.filter((t) => t.id !== id) });
    };

    const addReward = () => {
        if (!newReward.title) return;
        const reward: Reward = {
            id: Date.now().toString(),
            title: newReward.title,
            cost: newReward.cost || 5,
            emoji: newReward.emoji || '🎁',
        };
        updateData({ rewards: [...data.rewards, reward] });
        setNewReward({ title: '', cost: 5, emoji: '🎁' });
    };

    const removeReward = (id: string) => {
        updateData({ rewards: data.rewards.filter((r) => r.id !== id) });
    };

    const handleAddKid = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKidName.trim()) return;
        addKid(newKidName.trim(), newKidAvatar);
        setNewKidName('');
        setNewKidAvatar('👦');
        setShowAddKid(false);
    };

    const handleRemoveKid = (kidId: string, kidName: string) => {
        if (window.confirm(`确定要删除「${kidName}」吗？该小朋友的所有小红花数据将被清除。`)) {
            removeKid(kidId);
        }
    };

    const startEditKid = (kidId: string, name: string, avatar: string) => {
        setEditingKidId(kidId);
        setEditName(name);
        setEditAvatar(avatar);
    };

    const saveEditKid = () => {
        if (editingKidId && editName.trim()) {
            updateKid(editingKidId, { name: editName.trim(), avatar: editAvatar });
            setEditingKidId(null);
        }
    };

    const handleManualAdjust = (kidId: string, kidName: string) => {
        const amountStr = prompt(`为「${kidName}」调整小红花数量（扣除请填负数，如 -5）：`);
        if (!amountStr) return;
        const amount = parseInt(amountStr);
        if (!isNaN(amount) && amount !== 0) {
            manualAdjust(kidId, amount);
        }
    };

    const handleResetData = () => {
        if (
            window.confirm(
                '⚠️ 危险警告：这会彻底清空所有小朋友的小红花余额、任务和奖品设定。系统将恢复到初始出厂状态！\n\n确定要继续此极具破坏性的操作吗？'
            )
        ) {
            if (window.confirm('一旦按确定，所有数据灰飞烟灭。准备好了吗？')) {
                localStorage.removeItem('redflower_data');
                window.location.reload();
            }
        }
    };

    const handleChangePin = (e: React.FormEvent) => {
        e.preventDefault();
        if (oldPin !== data.pin) {
            setPinMsg('原密码错误');
            return;
        }
        if (newPin.length !== 4) {
            setPinMsg('新密码必须为4位');
            return;
        }
        if (newPin !== confirmPin) {
            setPinMsg('两次输入不一致');
            return;
        }
        changePin(newPin);
        setShowPinDialog(false);
        setOldPin('');
        setNewPin('');
        setConfirmPin('');
        setPinMsg('');
        alert('密码修改成功！');
    };

    return (
        <div className="parent-admin animate-slide-up">
            <header className="admin-header glass-panel">
                <button className="btn-secondary icon-btn" onClick={onBack}>
                    <ArrowLeft size={20} /> 返回主页
                </button>
                <h2>家长管理面板</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary icon-btn" onClick={() => { setShowPinDialog(true); setPinMsg(''); }}>
                        <Lock size={16} /> 修改密码
                    </button>
                    <button className="btn-danger" onClick={handleResetData}>
                        全站重置
                    </button>
                </div>
            </header>

            <div className="admin-tabs">
                <button className={`tab-btn ${activeTab === 'kids' ? 'active' : ''}`} onClick={() => setActiveTab('kids')}>
                    小朋友管理
                </button>
                <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
                    任务管理
                </button>
                <button className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => setActiveTab('rewards')}>
                    奖品管理
                </button>
            </div>

            <div className="admin-content glass-panel">
                {activeTab === 'kids' && (
                    <div className="admin-section">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button className="btn-primary form-btn" onClick={() => setShowAddKid(true)}>
                                <Plus size={18} />添加小朋友
                            </button>
                        </div>
                        <div className="list-view">
                            {data.kids.map((kid) => (
                                <div key={kid.id} className="list-item">
                                    {editingKidId === kid.id ? (
                                        <div className="kid-edit-row">
                                            <div className="avatar-picker-inline">
                                                {AVATAR_OPTIONS.slice(0, 6).map((av) => (
                                                    <button
                                                        key={av}
                                                        type="button"
                                                        className={`avatar-option-sm ${editAvatar === av ? 'selected' : ''}`}
                                                        onClick={() => setEditAvatar(av)}
                                                    >
                                                        {av}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="edit-name-input"
                                                maxLength={10}
                                            />
                                            <button className="btn-primary form-btn" onClick={saveEditKid}>
                                                保存
                                            </button>
                                            <button className="btn-secondary" onClick={() => setEditingKidId(null)}>
                                                取消
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="item-info">
                                                <span style={{ fontSize: '1.5rem' }}>{kid.avatar}</span>
                                                <strong>{kid.name}</strong>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.2rem',
                                                        fontWeight: 700,
                                                        fontSize: '1rem',
                                                        color: 'var(--primary)',
                                                    }}
                                                >
                                                    <span>{kid.balance}</span>
                                                    <Flower size={14} color="#c96b5e" fill="#e8a99f" />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                <button
                                                    className="btn-secondary icon-btn"
                                                    onClick={() => handleManualAdjust(kid.id, kid.name)}
                                                    title="手动调账"
                                                >
                                                    调账
                                                </button>
                                                <button
                                                    className="icon-btn btn-secondary"
                                                    onClick={() => startEditKid(kid.id, kid.name, kid.avatar)}
                                                    title="编辑"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    className="icon-btn btn-danger"
                                                    onClick={() => handleRemoveKid(kid.id, kid.name)}
                                                    title="删除"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                            {data.kids.length === 0 && <p className="text-muted">还没有小朋友，请先添加一个吧！</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div className="admin-section">
                        <div className="add-form">
                            <input
                                type="text"
                                placeholder="任务名称 (例如：练琴半小时)"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="奖励朵数"
                                value={newTask.flowers}
                                onChange={(e) => setNewTask({ ...newTask, flowers: parseInt(e.target.value) || 0 })}
                            />
                            <select value={newTask.type} onChange={(e) => setNewTask({ ...newTask, type: e.target.value as 'daily' | 'one-time' })}>
                                <option value="daily">每日固定</option>
                                <option value="one-time">一次性惊喜</option>
                            </select>
                            <button className="btn-primary form-btn" onClick={addTask}>
                                <Plus size={18} />添加
                            </button>
                        </div>
                        <div className="list-view">
                            {data.tasks.map((t) => (
                                <div key={t.id} className="list-item">
                                    <div className="item-info">
                                        <strong>{t.title}</strong>
                                        <span className="badge">{t.type === 'daily' ? '每天' : '一次'}</span>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.2rem',
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                color: 'var(--primary)',
                                            }}
                                        >
                                            <span>+{t.flowers}</span>
                                            <Flower size={14} color="#c96b5e" fill="#e8a99f" />
                                        </div>
                                    </div>
                                    <button className="btn-danger icon-btn" onClick={() => removeTask(t.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {data.tasks.length === 0 && <p className="text-muted">还没有任务，快添加一个吧！</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'rewards' && (
                    <div className="admin-section">
                        <div className="add-form">
                            <input
                                type="text"
                                placeholder="图标 Emoji"
                                style={{ width: '90px', flex: 'none' }}
                                value={newReward.emoji}
                                onChange={(e) => setNewReward({ ...newReward, emoji: e.target.value })}
                            />
                            <input
                                type="text"
                                placeholder="奖品名称 (例如：一次游乐园)"
                                value={newReward.title}
                                onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="花费朵数"
                                value={newReward.cost}
                                onChange={(e) => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 0 })}
                            />
                            <button className="btn-primary form-btn" onClick={addReward}>
                                <Plus size={18} />添加
                            </button>
                        </div>
                        <div className="list-view">
                            {data.rewards.map((r) => (
                                <div key={r.id} className="list-item">
                                    <div className="item-info">
                                        <span style={{ fontSize: '1.1rem' }}>{r.emoji}</span>
                                        <strong>{r.title}</strong>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.2rem',
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                color: 'var(--primary)',
                                            }}
                                        >
                                            <span>{r.cost}</span>
                                            <Flower size={14} color="#c96b5e" fill="#e8a99f" />
                                        </div>
                                    </div>
                                    <button className="btn-danger icon-btn" onClick={() => removeReward(r.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {data.rewards.length === 0 && <p className="text-muted">还没设置奖品哦</p>}
                        </div>
                    </div>
                )}
            </div>

            {showAddKid && (
                <div className="modal-overlay" onClick={() => setShowAddKid(false)}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>添加小朋友</h2>
                        </div>
                        <form className="add-kid-form-admin" onSubmit={handleAddKid}>
                            <div className="form-field-admin">
                                <label>昵称</label>
                                <input
                                    type="text"
                                    placeholder="输入小朋友的名字"
                                    value={newKidName}
                                    onChange={(e) => setNewKidName(e.target.value)}
                                    autoFocus
                                    maxLength={10}
                                />
                            </div>
                            <div className="form-field-admin">
                                <label>头像</label>
                                <div className="avatar-picker-admin">
                                    {AVATAR_OPTIONS.map((av) => (
                                        <button
                                            key={av}
                                            type="button"
                                            className={`avatar-option-admin ${newKidAvatar === av ? 'selected' : ''}`}
                                            onClick={() => setNewKidAvatar(av)}
                                        >
                                            {av}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-actions-admin">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddKid(false)}>
                                    取消
                                </button>
                                <button type="submit" className="btn-primary" disabled={!newKidName.trim()}>
                                    确认添加
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPinDialog && (
                <div className="modal-overlay" onClick={() => setShowPinDialog(false)}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>修改家长密码</h2>
                        </div>
                        <form className="add-kid-form-admin" onSubmit={handleChangePin}>
                            <div className="form-field-admin">
                                <label>原密码</label>
                                <input
                                    type="password"
                                    placeholder="输入当前密码"
                                    value={oldPin}
                                    onChange={(e) => setOldPin(e.target.value)}
                                    autoFocus
                                    maxLength={4}
                                    style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.1rem' }}
                                />
                            </div>
                            <div className="form-field-admin">
                                <label>新密码 (4位)</label>
                                <input
                                    type="password"
                                    placeholder="输入新密码"
                                    value={newPin}
                                    onChange={(e) => setNewPin(e.target.value)}
                                    maxLength={4}
                                    style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.1rem' }}
                                />
                            </div>
                            <div className="form-field-admin">
                                <label>确认新密码</label>
                                <input
                                    type="password"
                                    placeholder="再次输入新密码"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value)}
                                    maxLength={4}
                                    style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.1rem' }}
                                />
                            </div>
                            {pinMsg && (
                                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', textAlign: 'center' }}>
                                    {pinMsg}
                                </p>
                            )}
                            <div className="form-actions-admin">
                                <button type="button" className="btn-secondary" onClick={() => setShowPinDialog(false)}>
                                    取消
                                </button>
                                <button type="submit" className="btn-primary">
                                    确认修改
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
