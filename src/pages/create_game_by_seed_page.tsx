import { Devvit, useState } from '@devvit/public-api';

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
        <zstack height="100%" width="100%" alignment="center middle" gap="medium">
            <image
                url='background.png'
                description='Background'
                imageHeight={530}
                imageWidth={777}
                resizeMode='none'
            />

            <image
                url='interface_background/dialog_background1.png'
                description='Dialog background'
                imageHeight={420}
                imageWidth={420}
                resizeMode='none'
            />

            <hstack width="98%" height="98%" alignment="start top" gap="medium">
                <image url='buttons/b_back.png' description='Back Button' imageHeight={40} imageWidth={40} resizeMode='none' onPress={onBackToMenu} />
            </hstack>

            <vstack height="100%" width="310px" alignment="center middle" gap="small">
                <text size="xxlarge" color={TEXT_COLOR} selectable={false}>Enter the seed of the game</text>
                <text size="medium" color={TEXT_COLOR} selectable={false} wrap={true} alignment='center middle'>Please be aware that you will receive a reduced number of experience points if they have previously won the game</text>
                <text size="xxlarge" color={TEXT_COLOR} selectable={false}>{seed}</text>

                <hstack alignment="center middle" gap="small">
                    <image url='buttons/b_1.png' description='Button 1' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(1)} />
                    <image url='buttons/b_2.png' description='Button 2' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(2)} />
                    <image url='buttons/b_3.png' description='Button 3' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(3)} />
                    <image url='buttons/b_4.png' description='Button 4' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(4)} />
                    <image url='buttons/b_5.png' description='Button 5' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(5)} />
                    <image url='buttons/b_6.png' description='Button 6' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(6)} />
                </hstack>

                <hstack alignment="center middle" gap="small">
                    <image url='buttons/b_clear.png' description='Cancel Button' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onCancelPressed()} />
                    <image url='buttons/b_7.png' description='Button 7' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(7)} />
                    <image url='buttons/b_8.png' description='Button 8' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(8)} />
                    <image url='buttons/b_9.png' description='Button 9' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(9)} />
                    <image url='buttons/b_0.png' description='Button 0' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onNumberPressed(0)} />
                    <image url='buttons/b_X.png' description='Clear Button' imageHeight={40} imageWidth={40} resizeMode='none' onPress={() => onResetPressed()} />
                </hstack>

                <image url='buttons/b_start_game.png' description='Start Game button' imageHeight={40} imageWidth={137} resizeMode='none' onPress={() => onStartGame(seed)} />
            </vstack>
        </zstack>
    );
}