import { Devvit } from '@devvit/public-api';

const TEXT_COLOR = '#000000';

interface CreateGamePageProps {
    onBackToMenu: () => void;
    onOpenCreateBySeedPage: () => void;
    onStartGame: (seed: string) => void;
}

export function CreateGamePage({ onBackToMenu, onOpenCreateBySeedPage, onStartGame }: CreateGamePageProps) {
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
                url='interface_background/dialog_background2.png'
                description='Dialog background'
                imageHeight={420}
                imageWidth={420}
                resizeMode='none'
            />

            <hstack width="98%" height="98%" alignment="start top" gap="medium">
                <image url='buttons/b_back.png' description='Back Button' imageHeight={40} imageWidth={40} resizeMode='none' onPress={onBackToMenu} />
            </hstack>

            <text height="150px" width="300px" alignment="center top" size="xlarge" wrap={true} selectable={false} color={TEXT_COLOR}>Start a game with a seed to play a specific setup or generate a random one to explore new challenges!</text>

            <vstack height="300px" width="420px" alignment="center bottom" gap="small">
                <image url='buttons/b_generate_using_game_seed.png' description='Generate using game seed button' imageHeight={40} imageWidth={328} resizeMode='none' onPress={onOpenCreateBySeedPage} />
                <image url='buttons/b_start_random_game.png' description='Start a random game button' imageHeight={40} imageWidth={256} resizeMode='none' onPress={() => onStartGame("------")} />
            </vstack>
        </zstack>
    );
}