import { Devvit } from '@devvit/public-api';

interface MainMenuPageProps {
    onStartGame: () => void;
}

export function MainMenuPage({ onStartGame }: MainMenuPageProps) {
    return (
        <vstack height="100%" width="100%" alignment="center middle" gap="medium">
            <text size="large">Welcome to the Game</text>
            <button appearance="primary" onPress={onStartGame}>
                Start Game
            </button>
        </vstack>
    );
}