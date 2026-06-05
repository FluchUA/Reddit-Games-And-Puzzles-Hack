import { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/time_utils.js';

interface TimerComponentProps {
  getTotalTime: (totalTime: number) => void;
  isKeepGoing: boolean;
  totalTime: number | null;
  stopGame: () => void;
}

export function TimerComponent({ isKeepGoing, getTotalTime, totalTime, stopGame }: TimerComponentProps) {
  const [secondsValue, setSecondsValue] = useState(totalTime ?? 0);

  const secondsRef = useRef(secondsValue);
  const stopGameRef = useRef(stopGame);
  const getTotalTimeRef = useRef(getTotalTime);

  useEffect(() => { secondsRef.current = secondsValue; }, [secondsValue]);
  useEffect(() => { stopGameRef.current = stopGame; }, [stopGame]);
  useEffect(() => { getTotalTimeRef.current = getTotalTime; }, [getTotalTime]);

  useEffect(() => {
    if (!isKeepGoing) {
      getTotalTimeRef.current(secondsRef.current);
      return;
    }

    const interval = setInterval(() => {
      if (totalTime != null) {
        if (secondsRef.current > 0) {
          setSecondsValue((prev) => prev - 1);
        } else {
          stopGameRef.current();
        }
      } else {
        setSecondsValue((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isKeepGoing, totalTime]);

  return <span className="text-small bold-text"> {formatTime(secondsValue)} </span>;
}

export default TimerComponent;