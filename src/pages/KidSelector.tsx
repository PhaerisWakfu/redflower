import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Flower, LogOut, Plus } from 'lucide-react';
import './KidSelector.css';

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🦊', '🐰', '🐻', '🌟', '🦄', '🐼'];

interface Props {
    onSelectKid: (kidId: string) => void;
    onAdminLogin: () => void;
}

export const KidSelector: React.FC<Props> = ({ onSelectKid, onAdminLogin }) => {
    const { data, addKid } = useAppData();
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newName, setNewName] = useState('');
    const [newAvatar, setNewAvatar] = useState('👦');

    const handleAddKid = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        const kidId = addKid(newName.trim(), newAvatar);
        setNewName('');
        setNewAvatar('👦');
        setShowAddDialog(false);
        onSelectKid(kidId);
    };

    return (
        <div className="kid-selector animate-slide-up">
            <header className="selector-header">
                <h1>🌸 小红花</h1>
                <p>选择小朋友开始今天的任务吧！</p>
            </header>

            {data.kids.length === 0 ? (
                <div className="empty-state glass-panel">
                    <div className="empty-state-emoji">🌱</div>
                    <h3>还没有小朋友哦</h3>
                    <p>快来添加第一个小朋友吧！</p>
                    <button className="btn-primary" onClick={() => setShowAddDialog(true)}>
                        <Plus size={18} />
                        添加小朋友
                    </button>
                </div>
            ) : (
                <div className="kids-grid">
                    {data.kids.map((kid) => (
                        <div
                            key={kid.id}
                            className="kid-card glass-panel"
                            onClick={() => onSelectKid(kid.id)}
                        >
                            <div className="kid-avatar">{kid.avatar}</div>
                            <div className="kid-name">{kid.name}</div>
                            <div className="kid-balance">
                                <Flower size={14} color="#c96b5e" fill="#e8a99f" />
                                <span>{kid.balance}</span>
                            </div>
                        </div>
                    ))}
                    <div className="add-kid-card" onClick={() => setShowAddDialog(true)}>
                        <div className="add-kid-icon">+</div>
                        <div className="add-kid-text">添加小朋友</div>
                    </div>
                </div>
            )}

            <div className="selector-footer">
                <button className="btn-secondary icon-btn" onClick={onAdminLogin}>
                    <LogOut size={18} />
                    <span>家长管理</span>
                </button>
            </div>

            {showAddDialog && (
                <div className="modal-overlay" onClick={() => setShowAddDialog(false)}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '380px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>添加小朋友</h2>
                        </div>
                        <form className="add-kid-form" onSubmit={handleAddKid}>
                            <div className="form-field">
                                <label>昵称</label>
                                <input
                                    type="text"
                                    placeholder="输入小朋友的名字"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                    maxLength={10}
                                />
                            </div>
                            <div className="form-field">
                                <label>头像</label>
                                <div className="avatar-picker">
                                    {AVATAR_OPTIONS.map((av) => (
                                        <button
                                            key={av}
                                            type="button"
                                            className={`avatar-option ${newAvatar === av ? 'selected' : ''}`}
                                            onClick={() => setNewAvatar(av)}
                                        >
                                            {av}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowAddDialog(false)}>取消</button>
                                <button type="submit" className="btn-primary" disabled={!newName.trim()}>确认添加</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
