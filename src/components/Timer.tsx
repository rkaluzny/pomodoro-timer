import { useEffect, useRef } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { PlayIcon, PauseIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon, BellSlashIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

export function Timer() {
  const { state, dispatch } = useTimer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioLoopTimeoutRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Initialize audio on component mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.src = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
      audioRef.current.load();
    }

    return () => {
      if (audioLoopTimeoutRef.current) {
        window.clearTimeout(audioLoopTimeoutRef.current);
      }
    };
  }, []);

  // Handle timer completion and play sound
  useEffect(() => {
    const playSound = async () => {
      if (state.sound.enabled && audioRef.current && state.isAlarmActive) {
        try {
          audioRef.current.volume = state.sound.volume;
          // Reset the audio to start
          audioRef.current.currentTime = 0;
          // Play the sound
          await audioRef.current.play();
          // Schedule next play after the audio ends
          audioLoopTimeoutRef.current = window.setTimeout(playSound, audioRef.current.duration * 1000);
        } catch (error) {
          console.error('Error playing sound:', error);
        }
      }
    };

    if (state.timeRemaining === 0) {
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
          body: `${state.currentPhase === 'work' ? 'Break' : 'Work'} phase starting.`,
          icon: '/vite.svg'
        });
      }

      dispatch({ type: 'UPDATE_STATISTICS' });
      dispatch({ type: 'TOGGLE_PHASE' });
    }

    // Start playing sound if alarm is active
    if (state.isAlarmActive) {
      playSound();
    } else {
      // Stop any ongoing sound when alarm is deactivated
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (audioLoopTimeoutRef.current) {
        window.clearTimeout(audioLoopTimeoutRef.current);
      }
    }

    return () => {
      if (audioLoopTimeoutRef.current) {
        window.clearTimeout(audioLoopTimeoutRef.current);
      }
    };
  }, [state.timeRemaining, state.sound.enabled, state.sound.volume, state.currentPhase, state.isAlarmActive, dispatch]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Request Screen Wake Lock when timer is running (mobile standby)
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && !wakeLockRef.current) {
          // @ts-ignore - experimental API
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          wakeLockRef.current.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        }
      } catch (err) {
        console.warn('Wake Lock not available:', err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch (err) {
          // ignore
        }
        wakeLockRef.current = null;
      }
    };

    if (state.isRunning) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Re-acquire lock on visibility change (Android releases it automatically)
    const handleVisibility = () => {
      if (state.isRunning && !wakeLockRef.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      releaseWakeLock();
    };
  }, [state.isRunning]);

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
          onClick={() => {
            dispatch({ type: 'RESET_TIMER' });
            dispatch({ type: 'STOP_ALARM' });
          }}
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
        {state.isAlarmActive && (
          <motion.button
            className="btn-icon btn-alarm"
            onClick={() => dispatch({ type: 'STOP_ALARM' })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <BellSlashIcon className="icon" />
          </motion.button>
        )}
      </div>

      <audio ref={audioRef} preload="auto">
        <source src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" type="audio/mpeg" />
      </audio>
    </motion.div>
  );
} 