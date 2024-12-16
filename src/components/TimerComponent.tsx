import { Devvit, useState, useInterval } from '@devvit/public-api';
import { formatTime } from '../utils/time_utils.js';

interface TimerComponentProps {
    size: Devvit.Blocks.TextSize
    getTotalTime: (totalTime: number) => void;
    isKeepGoing: boolean;
    totalTime: number | null;
    stopGame: () => void;
}

export function TimerComponent({ size, isKeepGoing, getTotalTime, totalTime, stopGame }: TimerComponentProps) {
    const [secondsValue, setSomeSeconds] = useState(totalTime ?? 0);

    useInterval(() => {
        if (isKeepGoing) {
            if (totalTime != null) {
                if (secondsValue > 0) {
                    setSomeSeconds((prev) => prev - 1);
                } else {
                    stopGame();
                }
            } else {
                setSomeSeconds((prev) => prev + 1);
            }
        } else {
            getTotalTime(secondsValue);
        }
    }, 1000).start();

    return (
        <text size={size} weight="bold">{formatTime(secondsValue)}</text>
    );
};

export default TimerComponent;
