import { Timer } from './components/Timer';
import { Settings } from './components/Settings';
import { Statistics } from './components/Statistics';
import { ThemeToggle } from './components/ThemeToggle';
import { TimerProvider } from './contexts/TimerContext';

function App() {
  return (
    <TimerProvider>
      <div className="app">
        <div className="container">
          <header className="header">
            <h1>Focus Timer</h1>
            <ThemeToggle />
          </header>

          <div className="grid">
            <div className="flex-col gap-4">
              <Timer />
              <Statistics />
            </div>
            <div>
              <Settings />
            </div>
          </div>

          <footer className="footer">
            <p>Built with ❤️ using React, TypeScript, and Framer Motion</p>
          </footer>
        </div>
      </div>
    </TimerProvider>
  );
}

export default App;
