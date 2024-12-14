import { Devvit, useState, useInterval } from '@devvit/public-api';

interface TimerComponentProps {
    width: Devvit.Blocks.SizeString
    size: Devvit.Blocks.TextSize
    alignment: Devvit.Blocks.Alignment
    getTotalTime: (formattedTime: string) => void;
    isKeepGoing: boolean;
}

export function TimerComponent({ width, size, alignment, isKeepGoing, getTotalTime }: TimerComponentProps) {
    const [secondsValue, setSomeSeconds] = useState(0);

    function formatTime(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;

        return [hours, minutes, secs]
            .map((unit) => String(unit).padStart(2, "0"))
            .join(":");
    };

    useInterval(() => {
        if (isKeepGoing) {
            setSomeSeconds((prev) => prev + 1);
        } else {
            getTotalTime(formatTime(secondsValue));
        }
    }, 1000).start();


    return (
        <text width={width} size={size} alignment={alignment} weight="bold">{formatTime(secondsValue)}</text>
    );
};

export default TimerComponent;
