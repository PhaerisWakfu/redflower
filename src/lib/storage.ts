export interface Task {
  id: string;
  title: string;
  flowers: number;
  type: 'daily' | 'one-time';
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

export interface TaskStatus {
  completed: boolean;
  completedAt?: number;
}

export interface Kid {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  taskStatus: Record<string, TaskStatus>;
  history: HistoryEntry[];
}

export interface AppState {
  kids: Kid[];
  tasks: Task[];
  rewards: Reward[];
  pin: string;
  lastRefreshTime: number;
}

// Legacy single-child format for migration
interface LegacyAppState {
  balance: number;
  tasks: Array<Task & { completed: boolean; completedAt?: number }>;
  rewards: Reward[];
  history: HistoryEntry[];
  lastRefreshTime: number;
}

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: '自己完成按时起床', flowers: 1, type: 'daily' },
  { id: '2', title: '阅读半小时', flowers: 2, type: 'daily' },
  { id: '3', title: '帮妈妈做家务', flowers: 3, type: 'daily' },
];

const DEFAULT_REWARDS: Reward[] = [
  { id: '1', title: '看一集动画片', cost: 5, emoji: '📺' },
  { id: '2', title: '买一个冰淇淋', cost: 15, emoji: '🍦' },
  { id: '3', title: '去游乐园一次', cost: 100, emoji: '🎢' },
];

const DEFAULT_STATE: AppState = {
  kids: [],
  tasks: DEFAULT_TASKS,
  rewards: DEFAULT_REWARDS,
  pin: '1234',
  lastRefreshTime: Date.now(),
};

const STORAGE_KEY = 'redflower_data';

function isLegacyData(data: unknown): data is LegacyAppState {
  return (
    typeof data === 'object' &&
    data !== null &&
    'balance' in data &&
    typeof (data as LegacyAppState).balance === 'number' &&
    !('kids' in data)
  );
}

function migrateLegacyData(legacy: LegacyAppState): AppState {
  // Build taskStatus from legacy tasks' completed state
  const taskStatus: Record<string, TaskStatus> = {};
  const tasks: Task[] = legacy.tasks.map((t) => {
    if (t.completed) {
      taskStatus[t.id] = { completed: true, completedAt: t.completedAt };
    }
    return { id: t.id, title: t.title, flowers: t.flowers, type: t.type };
  });

  // Create a default kid with existing data
  const kid: Kid = {
    id: '1',
    name: '宝贝',
    avatar: '👦',
    balance: legacy.balance,
    taskStatus,
    history: legacy.history || [],
  };

  return {
    kids: [kid],
    tasks,
    rewards: legacy.rewards,
    pin: '1234',
    lastRefreshTime: legacy.lastRefreshTime,
  };
}

export const storage = {
  getData(): AppState {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    try {
      const data = JSON.parse(raw);
      if (isLegacyData(data)) {
        const migrated = migrateLegacyData(data);
        this.setData(migrated);
        return migrated;
      }
      // Ensure pin field exists for data created before pin feature
      const state = data as AppState;
      if (!state.pin) {
        state.pin = '1234';
        this.setData(state);
      }
      return state;
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

    const today8AM = new Date();
    today8AM.setHours(8, 0, 0, 0);

    const yesterday8AM = new Date(today8AM);
    yesterday8AM.setDate(yesterday8AM.getDate() - 1);

    const currentPeriodBoundary = now >= today8AM ? today8AM.getTime() : yesterday8AM.getTime();

    if (data.lastRefreshTime < currentPeriodBoundary) {
      // Get daily task IDs
      const dailyTaskIds = data.tasks
        .filter((t) => t.type === 'daily')
        .map((t) => t.id);

      // Reset daily task status for ALL kids
      data.kids = data.kids.map((kid) => {
        const newTaskStatus = { ...kid.taskStatus };
        for (const taskId of dailyTaskIds) {
          if (newTaskStatus[taskId]) {
            newTaskStatus[taskId] = { completed: false };
          }
        }
        return { ...kid, taskStatus: newTaskStatus };
      });

      data.lastRefreshTime = now.getTime();
      this.setData(data);
    }
  },
};
