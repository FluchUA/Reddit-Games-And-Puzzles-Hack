import { Devvit, useState } from '@devvit/public-api';
import { RulesDialogComponent } from '../components/RulesDialogComponent.js';
import { UserModel } from '../models/UserModel.js';
import { calculateLevelProgress } from '../utils/user_utils.js';

interface MainMenuPageProps {
    user: UserModel;
    onStartGame: () => void;
}

export function MainMenuPage({ user, onStartGame,  }: MainMenuPageProps) {
    const [isRulesShow, setIsRulesShow] = useState<boolean>(false);
    console.log(`MAIN xp:${user.currentXP}`);
    return (
        <zstack height="100%" width="100%" alignment="center middle" gap="medium">
            <vstack height="100%" width="100%" alignment="center middle" gap="medium">
                <text size="xxlarge">Hi, {user.name}! {calculateLevelProgress(user.currentXP).level}LVL</text>
                <text size="xxlarge">Let’s see what you can achieve today!</text>

                <hstack width="100%" alignment="center middle" gap="medium">
                    <text size="medium">XP: {user.currentXP}</text>
                    <text size="medium">Next Level: {calculateLevelProgress(user.currentXP).xpToNextLevel}</text>
                </hstack>

                <hstack width="100%" alignment="center middle" gap="medium">
                    <text size="medium">Total Wins: {user.winRate}</text>
                    <text size="medium">Total Losses: {user.loseRate}</text>
                </hstack>

                <button appearance="primary" onPress={onStartGame}>Start Game</button>
                <button appearance="primary" onPress={() => setIsRulesShow(true)}>Game Rules</button>
            </vstack>

            {isRulesShow && (
                <RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />
            )}
        </zstack>
    );
}