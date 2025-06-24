import { useTimer } from '../contexts/TimerContext';
import { motion } from 'framer-motion';
import { ChartBarIcon, FireIcon, ClockIcon } from '@heroicons/react/24/outline';

export function Statistics() {
  const { state } = useTimer();

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const stats = [
    {
      name: 'Sessions Completed',
      value: state.statistics.completedSessions,
      icon: ChartBarIcon,
      gradient: 'from-blue-500 to-indigo-600',
      darkGradient: 'dark:from-blue-600 dark:to-indigo-700',
    },
    {
      name: 'Total Work Time',
      value: formatTime(state.statistics.totalWorkTime),
      icon: ClockIcon,
      gradient: 'from-emerald-500 to-teal-600',
      darkGradient: 'dark:from-emerald-600 dark:to-teal-700',
    },
    {
      name: 'Current Streak',
      value: `${state.statistics.streakDays} days`,
      icon: FireIcon,
      gradient: 'from-orange-500 to-red-600',
      darkGradient: 'dark:from-orange-600 dark:to-red-700',
    },
  ];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <ChartBarIcon className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Statistics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/5 dark:to-gray-800/10 p-6 shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-75 ${stat.gradient} ${stat.darkGradient}" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                <motion.p
                  className={`mt-2 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient} ${stat.darkGradient}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.2, type: "spring" }}
                >
                  {stat.value}
                </motion.p>
              </div>
              <stat.icon className={`w-8 h-8 bg-clip-text text-transparent bg-gradient-to-br ${stat.gradient} ${stat.darkGradient}`} />
            </div>
            <div className="absolute bottom-0 right-0 opacity-5">
              <stat.icon className="w-24 h-24 transform translate-x-8 translate-y-8" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 