import { Devvit } from '@devvit/public-api';

const BUTTON_SIZE = "40px";

interface CreateGamePageProps {
    onBackToMenu: () => void;
    onOpenCreateBySeedPage: () => void;
    onStartGame: (seed: string) => void;
}

export function CreateGamePage({ onBackToMenu, onOpenCreateBySeedPage, onStartGame }: CreateGamePageProps) {
    return (
        <zstack height="95%" width="95%" alignment="center top" gap="medium">
            <hstack width="100%" alignment="start top" gap="medium">
                <button width={BUTTON_SIZE} height={BUTTON_SIZE} onPress={onBackToMenu}>🠜</button>
            </hstack>

            <vstack height="100%" width="100%" alignment="center middle" gap="medium">
                <text size="xlarge" weight="bold">Use a seed or generate a random game</text>

                <button appearance="primary" onPress={onOpenCreateBySeedPage}>Generate using game seed</button>
                <button appearance="primary" onPress={() => onStartGame("------")}>Start a random game</button>
            </vstack>
        </zstack>
    );
}