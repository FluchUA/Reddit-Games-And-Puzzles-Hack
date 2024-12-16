import { Devvit, useState } from '@devvit/public-api';
import { RulesDialogComponent } from '../components/RulesDialogComponent.js';
import { UserModel } from '../models/UserModel.js';
import { calculateLevelProgress } from '../utils/user_utils.js';

const TEXT_COLOR = '#000000';

interface MainMenuPageProps {
    user: UserModel;
    onStartGame: () => void;
}

export function MainMenuPage({ user, onStartGame, }: MainMenuPageProps) {
    const [isRulesShow, setIsRulesShow] = useState<boolean>(false);

    return (
        <zstack height="100%" width="100%" alignment="center middle" gap="medium">
            <image
                url='dark_transparent_pixel.png'
                description='Semi-transparent pixel to darken the background'
                imageHeight={1}
                imageWidth={1}
                height="420px"
                width="420px"
                resizeMode='fill'
            />

            <vstack height="100%" width="100%" alignment="center middle" gap="medium">
                <text size="xxlarge" color={TEXT_COLOR}>Hi, {user.name}! {calculateLevelProgress(user.currentXP).level}LVL</text>
                <text size="xxlarge" height="50px" alignment="center top" color={TEXT_COLOR}>Let’s see what you can achieve today!</text>

                <hstack width="100%" alignment="center middle" gap="small">
                    <text size="medium" alignment="center middle" color={TEXT_COLOR}>XP: {user.currentXP}</text>
                    <text size="medium" alignment="center middle" color={TEXT_COLOR}>Next Level: {calculateLevelProgress(user.currentXP).xpToNextLevel}</text>
                </hstack>

                <hstack width="100%" alignment="center middle" gap="small">
                    <text size="medium" alignment="center middle" color={TEXT_COLOR}>Total Wins: {user.winRate}</text>
                    <text size="medium" alignment="center middle" color={TEXT_COLOR}>Total Losses: {user.loseRate}</text>
                </hstack>

                <vstack height="120px" alignment="center bottom" gap="medium">
                    <button appearance="primary" onPress={onStartGame}>Start Game</button>
                    <button appearance="primary" onPress={() => setIsRulesShow(true)}>Game Rules</button>
                </vstack>
            </vstack>

            {isRulesShow && (
                <RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />
            )}
        </zstack>
    );
}