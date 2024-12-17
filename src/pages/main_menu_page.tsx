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

            <vstack height="100%" width="100%" alignment="center middle" gap="medium">
                <text size="xxlarge" color={TEXT_COLOR} selectable={false}>Hi, {user.name}! {calculateLevelProgress(user.currentXP).level}LVL</text>
                <text size="xlarge" height="50px" alignment="center top" color={TEXT_COLOR} selectable={false}>Let’s see what you can achieve today!</text>

                <hstack width="100%" alignment="center middle" gap="small">
                    <text size="medium" alignment="center middle" color={TEXT_COLOR} selectable={false}>XP: {user.currentXP}</text>
                    <text size="medium" alignment="center middle" color={TEXT_COLOR} selectable={false}>Next Level: {calculateLevelProgress(user.currentXP).xpToNextLevel}</text>
                </hstack>

                <hstack width="100%" alignment="center middle" gap="small">
                    <text size="medium" alignment="center middle" color={TEXT_COLOR} selectable={false}>Total Wins: {user.winRate}</text>
                    <text size="medium" alignment="center middle" color={TEXT_COLOR} selectable={false}>Total Losses: {user.loseRate}</text>
                </hstack>

                <vstack height="120px" alignment="center bottom" gap="small">
                    <image url='buttons/b_start_game.png' description='Start Game button' imageHeight={40} imageWidth={137} resizeMode='none' onPress={onStartGame} />
                    <image url='buttons/b_game_rules.png' description='Game Rules button' imageHeight={40} imageWidth={149} resizeMode='none' onPress={() => setIsRulesShow(true)} />
                </vstack>
            </vstack>

            {isRulesShow && (
                <RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />
            )}
        </zstack>
    );
}