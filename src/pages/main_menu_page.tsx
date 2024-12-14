import { Devvit, useState } from '@devvit/public-api';
import { RulesDialogComponent } from '../components/RulesDialogComponent.js';

interface MainMenuPageProps {
    onStartGame: () => void;
}

export function MainMenuPage({ onStartGame }: MainMenuPageProps) {
    const [isRulesShow, setIsRulesShow] = useState<boolean>(false);

    return (
        <zstack height="100%" width="100%" alignment="center middle" gap="medium">
            <vstack height="100%" width="100%" alignment="center middle" gap="medium">
                <text size="xxlarge">Welcome to the Game</text>
                <button appearance="primary" onPress={onStartGame}>Start Game</button>
                <button appearance="primary" onPress={() => setIsRulesShow(true)}>Game Rules</button>
            </vstack>

            {isRulesShow && (
                <RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />
            )}
        </zstack>
    );
}