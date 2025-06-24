import { useEffect, useRef } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { PlayIcon, PauseIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export function Timer() {
  const { state, dispatch } = useTimer();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (state.timeRemaining === 0) {
      if (state.sound.enabled && audioRef.current) {
        audioRef.current.volume = state.sound.volume;
        audioRef.current.play();
      }
      dispatch({ type: 'UPDATE_STATISTICS' });
      dispatch({ type: 'TOGGLE_PHASE' });
    }
  }, [state.timeRemaining, state.sound.enabled, state.sound.volume, dispatch]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    const totalDuration = state.currentPhase === 'work'
      ? state.selectedMode.workDuration
      : state.selectedMode.breakDuration;
    return ((totalDuration - state.timeRemaining) / totalDuration) * 100;
  };

  return (
    <motion.div 
      className="timer-container"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="timer-circle"
        whileHover={{ scale: 1.02 }}
      >
        <div className="timer-background" />
        
        <svg className="timer-progress" viewBox="0 0 320 320">
          <circle
            className="timer-progress-bg"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r="150"
            cx="160"
            cy="160"
          />
          <motion.circle
            className={`timer-progress-ring ${state.currentPhase}`}
            strokeWidth="6"
            strokeDasharray="942.5"
            strokeDashoffset={942.5 - (942.5 * calculateProgress()) / 100}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="150"
            cx="160"
            cy="160"
            initial={{ strokeDashoffset: 942.5 }}
            animate={{ strokeDashoffset: 942.5 - (942.5 * calculateProgress()) / 100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>

        <motion.div 
          className="timer-display"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.timeRemaining}
              className="timer-time"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {formatTime(state.timeRemaining)}
            </motion.div>
          </AnimatePresence>
          <motion.div 
            className="timer-phase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {state.currentPhase} Phase
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="timer-controls">
        <motion.button
          className={`btn-icon ${state.isRunning ? 'pause' : 'play'}`}
          onClick={() => dispatch({ type: state.isRunning ? 'PAUSE_TIMER' : 'START_TIMER' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {state.isRunning ? (
            <PauseIcon className="icon" />
          ) : (
            <PlayIcon className="icon" />
          )}
        </motion.button>
        <motion.button
          className="btn-icon btn-secondary"
          onClick={() => dispatch({ type: 'RESET_TIMER' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowPathIcon className="icon" />
        </motion.button>
        <motion.button
          className={`btn-icon ${state.sound.enabled ? 'sound-on' : 'sound-off'}`}
          onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {state.sound.enabled ? (
            <SpeakerWaveIcon className="icon" />
          ) : (
            <SpeakerXMarkIcon className="icon" />
          )}
        </motion.button>
      </div>

      <audio ref={audioRef} preload="auto">
        <source src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" type="audio/mpeg" />
      </audio>
    </motion.div>
  );
} 