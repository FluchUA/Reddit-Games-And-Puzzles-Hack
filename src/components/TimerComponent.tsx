import { Devvit, useState, useInterval } from '@devvit/public-api';
import { formatTime } from '../utils/time_utils.js';

interface TimerComponentProps {
    size: Devvit.Blocks.TextSize
    getTotalTime: (totalTime: number) => void;
    isKeepGoing: boolean;
}

export function TimerComponent({ size, isKeepGoing, getTotalTime }: TimerComponentProps) {
    const [secondsValue, setSomeSeconds] = useState(0);

    useInterval(() => {
        if (isKeepGoing) {
            setSomeSeconds((prev) => prev + 1);
        } else {
            getTotalTime(secondsValue);
        }
    }, 1000).start();

    return (
        <text size={size} weight="bold">{formatTime(secondsValue)}</text>
    );
};

export default TimerComponent;
