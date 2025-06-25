import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';

type TimerMode = {
  workDuration: number;
  breakDuration: number;
  name: string;
};

type TimerState = {
  isRunning: boolean;
  currentPhase: 'work' | 'break';
  timeRemaining: number;
  selectedMode: TimerMode;
  customModes: TimerMode[];
  statistics: {
    completedSessions: number;
    totalWorkTime: number;
    totalBreakTime: number;
    lastUpdated: string;
    streakDays: number;
  };
  sound: {
    enabled: boolean;
    volume: number;
  };
  lastActiveTimestamp: number;
  isAlarmActive: boolean;
};

type TimerAction =
  | { type: 'START_TIMER' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'SET_MODE'; payload: TimerMode }
  | { type: 'TICK' }
  | { type: 'TOGGLE_PHASE' }
  | { type: 'ADD_CUSTOM_MODE'; payload: TimerMode }
  | { type: 'REMOVE_CUSTOM_MODE'; payload: string }
  | { type: 'UPDATE_STATISTICS' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'LOAD_STATE'; payload: Partial<TimerState> }
  | { type: 'STOP_ALARM' };

const defaultModes: TimerMode[] = [
  { name: 'Classic Pomodoro', workDuration: 25 * 60, breakDuration: 5 * 60 },
  { name: 'Long Session', workDuration: 50 * 60, breakDuration: 10 * 60 },
];

const initialState: TimerState = {
  isRunning: false,
  currentPhase: 'work',
  timeRemaining: defaultModes[0].workDuration,
  selectedMode: defaultModes[0],
  customModes: [],
  statistics: {
    completedSessions: 0,
    totalWorkTime: 0,
    totalBreakTime: 0,
    lastUpdated: new Date().toISOString(),
    streakDays: 0,
  },
  sound: {
    enabled: true,
    volume: 0.5,
  },
  lastActiveTimestamp: Date.now(),
  isAlarmActive: false,
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_TIMER':
      return { ...state, isRunning: true, lastActiveTimestamp: Date.now() };
    case 'PAUSE_TIMER':
      return { ...state, isRunning: false };
    case 'RESET_TIMER':
      return {
        ...state,
        isRunning: false,
        timeRemaining: state.currentPhase === 'work'
          ? state.selectedMode.workDuration
          : state.selectedMode.breakDuration,
        lastActiveTimestamp: Date.now(),
      };
    case 'SET_MODE':
      return {
        ...state,
        selectedMode: action.payload,
        timeRemaining: state.currentPhase === 'work'
          ? action.payload.workDuration
          : action.payload.breakDuration,
        isRunning: false,
        lastActiveTimestamp: Date.now(),
      };
    case 'TICK': {
      const now = Date.now();
      const timePassed = Math.floor((now - state.lastActiveTimestamp) / 1000);
      const newTimeRemaining = Math.max(0, state.timeRemaining - timePassed);

      return {
        ...state,
        timeRemaining: newTimeRemaining,
        lastActiveTimestamp: now,
      };
    }
    case 'TOGGLE_PHASE':
      const newPhase = state.currentPhase === 'work' ? 'break' : 'work';
      return {
        ...state,
        currentPhase: newPhase,
        timeRemaining: newPhase === 'work'
          ? state.selectedMode.workDuration
          : state.selectedMode.breakDuration,
        isRunning: false,
        lastActiveTimestamp: Date.now(),
        isAlarmActive: true,
      };
    case 'ADD_CUSTOM_MODE': {
      const newCustomModes = [...state.customModes, action.payload];
      return {
        ...state,
        customModes: newCustomModes,
        selectedMode: action.payload,
        timeRemaining: state.currentPhase === 'work'
          ? action.payload.workDuration
          : action.payload.breakDuration,
      };
    }
    case 'REMOVE_CUSTOM_MODE': {
      const isSelectedMode = state.selectedMode.name === action.payload;
      const filteredModes = state.customModes.filter(mode => mode.name !== action.payload);
      
      let newSelectedMode = state.selectedMode;
      let newTimeRemaining = state.timeRemaining;
      
      if (isSelectedMode) {
        newSelectedMode = filteredModes.length > 0 
          ? filteredModes[0] 
          : defaultModes[0];
          
        newTimeRemaining = state.currentPhase === 'work'
          ? newSelectedMode.workDuration
          : newSelectedMode.breakDuration;
      }
      
      return {
        ...state,
        customModes: filteredModes,
        selectedMode: newSelectedMode,
        timeRemaining: newTimeRemaining,
        isRunning: false,
      };
    }
    case 'UPDATE_STATISTICS': {
      const now = new Date();
      const lastUpdated = new Date(state.statistics.lastUpdated);
      const isNewDay = now.getDate() !== lastUpdated.getDate() ||
                      now.getMonth() !== lastUpdated.getMonth() ||
                      now.getFullYear() !== lastUpdated.getFullYear();
      
      return {
        ...state,
        statistics: {
          completedSessions: state.statistics.completedSessions + 1,
          totalWorkTime: state.statistics.totalWorkTime + (
            state.currentPhase === 'work'
              ? state.selectedMode.workDuration - state.timeRemaining
              : 0
          ),
          totalBreakTime: state.statistics.totalBreakTime + (
            state.currentPhase === 'break'
              ? state.selectedMode.breakDuration - state.timeRemaining
              : 0
          ),
          lastUpdated: now.toISOString(),
          streakDays: isNewDay ? state.statistics.streakDays + 1 : state.statistics.streakDays,
        },
      };
    }
    case 'TOGGLE_SOUND':
      return {
        ...state,
        sound: {
          ...state.sound,
          enabled: !state.sound.enabled,
        },
      };
    case 'SET_VOLUME':
      return {
        ...state,
        sound: {
          ...state.sound,
          volume: action.payload,
        },
      };
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
      };
    case 'STOP_ALARM':
      return {
        ...state,
        isAlarmActive: false,
      };
    default:
      return state;
  }
}

const TimerContext = createContext<{
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
} | null>(null);

const STORAGE_KEY = 'pomodoro_state';

function getInitialState(): TimerState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: Partial<TimerState> = JSON.parse(saved);
      // Backward-compatibility: ensure required fields exist
      const base = { ...initialState, ...parsed } as TimerState;
      // If custom modes exist but no selectedMode set, pick first custom
      if (base.customModes.length > 0 && !base.selectedMode) {
        base.selectedMode = base.customModes[0];
      }
      return base;
    }
  } catch (err) {
    console.error('Error parsing saved timer state', err);
  }
  return initialState;
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState, getInitialState);

  // Persist relevant state slices to localStorage whenever they change
  useEffect(() => {
    const stateToSave = {
      customModes: state.customModes,
      statistics: state.statistics,
      sound: state.sound,
      selectedMode: state.selectedMode,
    } as Partial<TimerState>;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Failed to save timer state', err);
    }
  }, [state.customModes, state.statistics, state.sound, state.selectedMode]);

  // Handle background timer updates
  useEffect(() => {
    let interval: number | undefined;

    if (state.isRunning) {
      interval = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [state.isRunning]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isRunning) {
        dispatch({ type: 'TICK' });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [state.isRunning]);

  return (
    <TimerContext.Provider value={{ state, dispatch }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
} 