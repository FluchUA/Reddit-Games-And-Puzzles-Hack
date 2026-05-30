import { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/time_utils.js';

interface TimerComponentProps {
  className?: string;
  getTotalTime: (totalTime: number) => void;
  isKeepGoing: boolean;
  totalTime: number | null;
  stopGame: () => void;
}

export function TimerComponent({ className = "text-medium", isKeepGoing, getTotalTime, totalTime, stopGame }: TimerComponentProps) {
  const [secondsValue, setSecondsValue] = useState(totalTime ?? 0);
  const secondsRef = useRef(secondsValue);

  // Держим ref в синхронизации, чтобы использовать актуальное значение внутри setInterval
  useEffect(() => {
    secondsRef.current = secondsValue;
  }, [secondsValue]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isKeepGoing) {
        if (totalTime != null) {
          if (secondsRef.current > 0) {
            setSecondsValue((prev) => prev - 1);
          } else {
            stopGame();
          }
        } else {
          setSecondsValue((prev) => prev + 1);
        }
      } else {
        getTotalTime(secondsRef.current);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isKeepGoing, totalTime, stopGame, getTotalTime]);

  return (<span className={`timer-text ${className}`}> {formatTime(secondsValue)} </span>);
}

export default TimerComponent;