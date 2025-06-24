import { useState } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, PlusIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export function Settings() {
  const { state, dispatch } = useTimer();
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWork, setCustomWork] = useState('25');
  const [customBreak, setCustomBreak] = useState('5');

  const handleAddCustomMode = (e: React.FormEvent) => {
    e.preventDefault();
    const workDuration = parseInt(customWork) * 60;
    const breakDuration = parseInt(customBreak) * 60;

    if (workDuration > 0 && breakDuration > 0) {
      const newMode = {
        name: customName || `Custom (${customWork}/${customBreak})`,
        workDuration,
        breakDuration,
      };
      dispatch({ type: 'ADD_CUSTOM_MODE', payload: newMode });
      setShowCustomForm(false);
      setCustomName('');
      setCustomWork('25');
      setCustomBreak('5');
    }
  };

  const handleRemoveMode = (name: string) => {
    if (state.selectedMode.name === name) {
      dispatch({ type: 'SET_MODE', payload: state.customModes[0] || state.selectedMode });
    }
    dispatch({ type: 'REMOVE_CUSTOM_MODE', payload: name });
  };

  return (
    <motion.div
      className="card space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3">
        <AdjustmentsHorizontalIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Timer Settings
        </h2>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Preset Modes</h3>
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {[...state.customModes].map((mode, index) => (
              <motion.div
                key={mode.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative"
              >
                <motion.button
                  className={`w-full ${
                    state.selectedMode.name === mode.name
                      ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
                  } rounded-xl p-4 text-left pr-12 shadow-md hover:shadow-lg transition-all duration-200`}
                  onClick={() => dispatch({ type: 'SET_MODE', payload: mode })}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="font-medium">{mode.name}</div>
                  <div className="text-sm opacity-75">
                    {mode.workDuration / 60}m work / {mode.breakDuration / 60}m break
                  </div>
                </motion.button>
                <motion.button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                  onClick={() => handleRemoveMode(mode.name)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <TrashIcon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-4">
        <AnimatePresence mode="wait">
          {showCustomForm ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleAddCustomMode}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  Name (optional)
                </label>
                <input
                  type="text"
                  className="input"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Custom Timer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Work (minutes)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={customWork}
                    onChange={(e) => setCustomWork(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Break (minutes)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={customBreak}
                    onChange={(e) => setCustomBreak(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <motion.button
                  type="submit"
                  className="btn btn-primary flex-1"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add Custom Mode
                </motion.button>
                <motion.button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCustomForm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              className="btn w-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300"
              onClick={() => setShowCustomForm(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Custom Mode
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-4 pt-4 border-t dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Sound Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sound Notifications</label>
            <motion.button
              className={`relative w-12 h-6 rounded-full transition-colors ${
                state.sound.enabled ? 'bg-gradient-to-r from-primary to-primary-dark' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              onClick={() => dispatch({ type: 'TOGGLE_SOUND' })}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 shadow-md"
                animate={{ x: state.sound.enabled ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.sound.volume}
              onChange={(e) => dispatch({ type: 'SET_VOLUME', payload: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
} 