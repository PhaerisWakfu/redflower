import React from 'react';
import type { Reward } from '../lib/storage';
import { Flower } from 'lucide-react';
import './RewardCard.css';

interface RewardCardProps {
    reward: Reward;
    canAfford: boolean;
    onRedeem: (id: string) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, canAfford, onRedeem }) => {
    return (
        <div className={`reward-card glass-panel ${!canAfford ? 'disabled' : ''}`}>
            <div className="reward-emoji">{reward.emoji}</div>
            <h3 className="reward-title">{reward.title}</h3>
            <button
                className="btn-primary redeem-btn"
                onClick={() => onRedeem(reward.id)}
                disabled={!canAfford}
            >
                <Flower size={16} fill="#e8a99f" color="#c96b5e" />
                <span>{reward.cost} 朵兑换</span>
            </button>
            {!canAfford && <div className="afford-hint">余额不足</div>}
        </div>
    );
};
