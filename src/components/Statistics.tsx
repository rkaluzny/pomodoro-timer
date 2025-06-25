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
      color: 'text-blue-600 dark:text-blue-400',
      gradient: 'from-blue-500 to-indigo-600',
      darkGradient: 'dark:from-blue-400 dark:to-indigo-500',
    },
    {
      name: 'Total Work Time',
      value: formatTime(state.statistics.totalWorkTime),
      icon: ClockIcon,
      color: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-500 to-teal-600',
      darkGradient: 'dark:from-emerald-400 dark:to-teal-500',
    },
    {
      name: 'Current Streak',
      value: `${state.statistics.streakDays} days`,
      icon: FireIcon,
      color: 'text-orange-600 dark:text-orange-400',
      gradient: 'from-orange-500 to-red-600',
      darkGradient: 'dark:from-orange-400 dark:to-red-500',
    },
  ];

  return (
    <motion.div
      className="card statistics-card"
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
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          >
            <div className={`stat-highlight ${stat.gradient} ${stat.darkGradient}`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label">{stat.name}</p>
                <motion.p
                  className={`stat-value ${stat.color}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.2, type: "spring" }}
                >
                  {stat.value}
                </motion.p>
              </div>
              <stat.icon className={`stat-icon ${stat.color}`} />
            </div>
            <div className="stat-background">
              <stat.icon className="w-24 h-24 transform translate-x-8 translate-y-8" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 