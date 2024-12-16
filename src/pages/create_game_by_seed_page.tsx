import { Devvit, useState } from '@devvit/public-api';

const BUTTON_SIZE = "40px";
const TEXT_COLOR = '#000000';

interface CreateGameBySeedPageProps {
    onBackToMenu: () => void;
    onStartGame: (seed: string) => void;
}

export function CreateGameBySeedPage({ onBackToMenu, onStartGame }: CreateGameBySeedPageProps) {
    const [seed, setSeed] = useState<string>("------");

    function onNumberPressed(value: number) {
        const firstDashIndex = seed.indexOf('-');
        if (firstDashIndex !== -1) {
            const newSeed = seed.slice(0, firstDashIndex) + value + seed.slice(firstDashIndex + 1);
            setSeed(newSeed);
        }
    };

    function onCancelPressed() {
        // If the row already consists of only dashes, do nothing
        if (!seed.match(/[^-]/)) {
            return;
        }

        const lastFilledIndex = seed.lastIndexOf(seed.match(/[^-]/g)?.pop() ?? '');

        // Replace the symbol with a dash
        if (lastFilledIndex !== -1) {
            const newSeed = seed.slice(0, lastFilledIndex) + '-' + seed.slice(lastFilledIndex + 1);
            setSeed(newSeed);
        }
    };

    function onResetPressed() {
        setSeed("------");
    };

    return (
        <zstack height="95%" width="95%" alignment="center middle" gap="medium">
            <image
                url='dark_transparent_pixel.png'
                description='Semi-transparent pixel to darken the background'
                imageHeight={1}
                imageWidth={1}
                height="420px"
                width="420px"
                resizeMode='fill'
            />

            <hstack width="100%" height="100%" alignment="start top" gap="medium">
                <button width={BUTTON_SIZE} height={BUTTON_SIZE} onPress={onBackToMenu}>🠜</button>
            </hstack>

            <vstack height="100%" width="310px" alignment="center middle" gap="small">
                <text size="xlarge" weight="bold" color={TEXT_COLOR}>Enter the seed of the game</text>
                <text size="medium" weight="bold" color={TEXT_COLOR} wrap={true} alignment='center middle'>Please be aware that you will receive a reduced number of experience points if they have previously won the game</text>
                <text size="xxlarge" weight="bold" color={TEXT_COLOR}>{seed}</text>

                <hstack alignment="center middle" gap="small">
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(1)}>1</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(2)}>2</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(3)}>3</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(4)}>4</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(5)}>5</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(6)}>6</button>
                </hstack>

                <hstack alignment="center middle" gap="small">
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onCancelPressed()}>←</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(7)}>7</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(8)}>8</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(9)}>9</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(0)}>0</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onResetPressed()}>X</button>
                </hstack>

                <button appearance="primary" onPress={() => onStartGame(seed)}>Start Game</button>
            </vstack>
        </zstack>
    );
}