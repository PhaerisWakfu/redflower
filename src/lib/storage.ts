export interface Task {
  id: string;
  title: string;
  flowers: number;
  type: 'daily' | 'one-time';
  completed: boolean;
  completedAt?: number;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  emoji: string;
}

export interface HistoryEntry {
  id: string;
  date: number;
  amount: number;
  type: 'earn' | 'spend';
  description: string;
}

export interface AppState {
  balance: number;
  tasks: Task[];
  rewards: Reward[];
  history: HistoryEntry[];
  lastRefreshTime: number;
}

const DEFAULT_STATE: AppState = {
  balance: 0,
  tasks: [
    { id: '1', title: '自己完成按时起床', flowers: 1, type: 'daily', completed: false },
    { id: '2', title: '阅读半小时', flowers: 2, type: 'daily', completed: false },
    { id: '3', title: '帮妈妈做家务', flowers: 3, type: 'daily', completed: false },
  ],
  rewards: [
    { id: '1', title: '看一集动画片', cost: 5, emoji: '📺' },
    { id: '2', title: '买一个冰淇淋', cost: 15, emoji: '🍦' },
    { id: '3', title: '去游乐园一次', cost: 100, emoji: '🎢' },
  ],
  history: [],
  lastRefreshTime: Date.now(),
};

const STORAGE_KEY = 'redflower_data';

export const storage = {
  getData(): AppState {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_STATE;
    try {
      return JSON.parse(data) as AppState;
    } catch {
      return DEFAULT_STATE;
    }
  },

  setData(data: AppState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // 检查是否需要每日更新（每天早上8点更新）
  checkAndRefreshDailyTasks() {
    const data = this.getData();
    const now = new Date();
    
    // 获取当天的早上8点
    const today8AM = new Date();
    today8AM.setHours(8, 0, 0, 0);

    // 获取昨天的早上8点
    const yesterday8AM = new Date(today8AM);
    yesterday8AM.setDate(yesterday8AM.getDate() - 1);

    // 确定当前的周期基准时间：
    // 如果现在过了今天8点，周期是从今天8点开始；否则是从昨天8点开始。
    const currentPeriodBoundary = now >= today8AM ? today8AM.getTime() : yesterday8AM.getTime();

    // 如果最后刷新时间跨越了当前的周期界限时间，重置所有日常任务
    if (data.lastRefreshTime < currentPeriodBoundary) {
      data.tasks = data.tasks.map((task) => 
        task.type === 'daily' ? { ...task, completed: false, completedAt: undefined } : task
      );
      data.lastRefreshTime = now.getTime();
      this.setData(data);
    }
  }
};
