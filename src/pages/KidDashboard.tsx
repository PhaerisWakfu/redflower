import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { TaskItem } from '../components/TaskItem';
import { RewardCard } from '../components/RewardCard';
import { Flower, History, LogOut } from 'lucide-react';
import './KidDashboard.css';

interface Props {
    onAdminLogin: () => void;
}

export const KidDashboard: React.FC<Props> = ({ onAdminLogin }) => {
    const { data, completeTask, redeemReward } = useAppData();
    const [showHistory, setShowHistory] = useState(false);
    const [redeemedTicket, setRedeemedTicket] = useState<{ title: string, emoji: string, cost: number } | null>(null);
    const [particles, setParticles] = useState<{ id: number, type: 'flower' | 'confetti', x: number, y: number }[]>([]);

    const triggerParticles = (x: number, y: number, type: 'flower' | 'confetti') => {
        const newParticle = { id: Date.now(), type, x, y };
        setParticles(prev => [...prev, newParticle]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== newParticle.id));
        }, 1500); // 1.5s animation duration
    };

    const handleTaskComplete = (taskId: string, e: React.MouseEvent) => {
        if (completeTask(taskId)) {
            triggerParticles(e.clientX, e.clientY, 'flower');
        }
    };

    const handleRedeem = (rewardId: string) => {
        const targetReward = data.rewards.find(r => r.id === rewardId);
        if (targetReward && redeemReward(rewardId)) {
            triggerParticles(window.innerWidth / 2, window.innerHeight / 2, 'confetti');
            setRedeemedTicket(targetReward);
        }
    };

    const completedCount = data.tasks.filter(t => t.completed && t.type === 'daily').length;
    const dailyCount = data.tasks.filter(t => t.type === 'daily').length;
    const progress = dailyCount === 0 ? 0 : (completedCount / dailyCount) * 100;

    return (
        <div className="kid-dashboard animate-slide-up">
            {/* Particle Effects */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className={`particle ${p.type}`}
                    style={{ left: p.x, top: p.y }}
                >
                    {p.type === 'flower' ? '🌸' : '🎉'}
                </div>
            ))}

            <header className="dashboard-header glass-panel">
                <div className="balance-section">
                    <h2>我的小红花</h2>
                    <div className="balance-display">
                        <Flower size={36} color="#c96b5e" fill="#e8a99f" className="flower-icon" />
                        <span className="balance-number">{data.balance}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary icon-btn" onClick={() => setShowHistory(true)}>
                        <History size={20} />
                        <span>日记</span>
                    </button>
                    <button className="btn-secondary icon-btn" onClick={onAdminLogin}>
                        <LogOut size={20} />
                        <span>家长</span>
                    </button>
                </div>
            </header>

            <div className="dashboard-content">
                <section className="task-section">
                    <div className="section-header">
                        <h3>任务清单</h3>
                        <span className="progress-text">{completedCount} / {dailyCount}</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="task-list">
                        {data.tasks.map(task => (
                            <div key={task.id} onClick={(e) => handleTaskComplete(task.id, e)}>
                                <TaskItem task={task} onComplete={() => { }} />
                            </div>
                        ))}
                        {data.tasks.length === 0 && <p className="empty-hint">暂无任务，休息一下吧！</p>}
                    </div>
                </section>

                <section className="reward-section">
                    <div className="section-header">
                        <h3>兑换超市</h3>
                    </div>
                    <div className="reward-grid">
                        {data.rewards.map(reward => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                canAfford={data.balance >= reward.cost}
                                onRedeem={handleRedeem}
                            />
                        ))}
                        {data.rewards.length === 0 && <p className="empty-hint">超市还是空的哦</p>}
                    </div>
                </section>
            </div>

            {showHistory && (
                <div className="modal-overlay" onClick={() => setShowHistory(false)}>
                    <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>小红花日记</h2>
                        </div>
                        <div className="history-list">
                            {data.history.map(entry => (
                                <div key={entry.id} className="history-item">
                                    <div className="history-info">
                                        <span className="history-desc">{entry.description}</span>
                                        <span className="history-date">
                                            {new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`history-amount ${entry.type}`}>
                                        {entry.type === 'earn' ? '+' : '-'}{entry.amount} 朵
                                    </div>
                                </div>
                            ))}
                            {data.history.length === 0 && <p className="empty-hint">还没有记录哦</p>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-primary" onClick={() => setShowHistory(false)}>关闭</button>
                        </div>
                    </div>
                </div>
            )}

            {redeemedTicket && (
                <div className="modal-overlay ticket-overlay" onClick={() => setRedeemedTicket(null)}>
                    <div className="ticket-card animate-pop" onClick={e => e.stopPropagation()}>
                        <div className="ticket-sparkles">✨</div>
                        <h2>兑换凭证</h2>
                        <div className="ticket-emoji">{redeemedTicket.emoji}</div>
                        <h3>{redeemedTicket.title}</h3>
                        <p className="ticket-cost">价值 {redeemedTicket.cost} 朵小红花</p>
                        <div className="ticket-divider"></div>
                        <p className="ticket-footer">请立刻将这张卡片展示给你身边的大人，换取奖励吧！🚀</p>
                        <button className="btn-primary" onClick={() => setRedeemedTicket(null)}>开心收下</button>
                    </div>
                </div>
            )}
        </div>
    );
};
