import { Devvit, Context, useAsync, RedditAPIClient, RedisClient, useState } from '@devvit/public-api';
import { UserModel } from '../models/UserModel.js';
import ProgressIndicatorComponent from './ProgressIndicatorComponent.js';

import { calculateLevelProgress } from '../utils/user_utils.js';
import { formatTime } from '../utils/time_utils.js';

const TEXT_COLOR = '#000000';
const VICTORY_XP_VALUE = 300;
const SECOND_VICTORY_XP_VALUE = 15;
const SHARE_XP_VALUE = 200;

interface VictoryDialogProps {
    onDialogClose: () => void;
    totalTime: number;
    gameSeed: string;
    isCompletedGame: boolean;
    user: UserModel;
    redditClient: RedditAPIClient;
    redisClient: RedisClient;
}

export function VictoryDialogComponent({ onDialogClose, totalTime, gameSeed, isCompletedGame, user, redditClient, redisClient }: VictoryDialogProps) {
    const { data: userData, loading: scoreLoading, error: scoreError } = useAsync(async () => {
        let currentUser = user;
        currentUser.winRate += 1;
        currentUser.currentXP += isCompletedGame ? SECOND_VICTORY_XP_VALUE : VICTORY_XP_VALUE;
        currentUser.completedGames.push(gameSeed);

        await redisClient.hSet(`userDetails:${currentUser.id}`, {
            xpValue: currentUser.currentXP.toString(),
            winRate: currentUser.winRate.toString(),
            loseRate: currentUser.loseRate.toString(),
            recordsWon: currentUser.recordsWon.toString(),
        });

        // Clear existing games for this user
        await redisClient.del(`completedGames:${currentUser.id}`);
        // // Add all games to the sorted set with scores as indices
        const members = currentUser.completedGames.map((game, index) => ({ score: index, member: game }));
        await redisClient.zAdd(`completedGames:${currentUser.id}`, ...members);

        return currentUser;
    });

    async function onCreatePost() {
        const userModel = (userData ?? user);
        await redisClient.hSet(`userDetails:${userModel.id}`, {
            xpValue: (userModel.currentXP + SHARE_XP_VALUE).toString(),
            winRate: userModel.winRate.toString(),
            loseRate: userModel.loseRate.toString(),
            recordsWon: userModel.recordsWon.toString(),
        });

        const currentSubreddit = await redditClient.getCurrentSubreddit();
        const subpost = await redditClient.submitPost({
            title: 'Can you beat my time?',
            subredditName: currentSubreddit.name,
            preview: (<ProgressIndicatorComponent />),
        });

        await redisClient.hSet(`subpost:${subpost.id}`, {
            totalTime: totalTime.toString(),
            gameSeed: gameSeed,
            userID: userModel.id,
        });

        onDialogClose();
    }

    return (
        <zstack height="100%" width="100%" alignment="center middle" gap="medium">
            <image
                url='dark_transparent_pixel.png'
                description='Semi-transparent pixel to darken the background'
                imageHeight={1}
                imageWidth={1}
                height="100%"
                width="100%"
                resizeMode='fill'
            />

            <image
                url='white_pixel.png'
                description='White pixel to set the dialog background'
                imageHeight={1}
                imageWidth={1}
                height="240px"
                width="320px"
                resizeMode='fill'
            />

            <vstack height="100%" width="400px" alignment="center middle" gap="small">
                <text size="xxlarge" weight="bold" color={TEXT_COLOR}>Victory +{isCompletedGame ? SECOND_VICTORY_XP_VALUE : VICTORY_XP_VALUE}XP</text>
                <text size="xlarge" weight="bold" color={TEXT_COLOR}>Time: {formatTime(totalTime)}</text>

                {isCompletedGame &&
                    <vstack height="50px" width="100%" alignment="center middle" gap="small">
                        <text size="small" weight="bold" color={TEXT_COLOR}>Since you've already played this game,</text>
                        <text size="small" weight="bold" color={TEXT_COLOR}>you've received a reduced amount of experience points</text>
                    </vstack>
                }

                <hstack width="100%" alignment="center middle" gap="medium">
                    <text size="medium" color={TEXT_COLOR}>LVL: {scoreLoading ? "-" : calculateLevelProgress((userData ?? user).currentXP).level}</text>
                    <text size="medium" color={TEXT_COLOR}>XP: {scoreLoading ? "-" : (userData ?? user).currentXP}</text>
                    <text size="medium" color={TEXT_COLOR}>Next Level: {scoreLoading ? "-" : calculateLevelProgress((userData ?? user).currentXP).xpToNextLevel}</text>
                </hstack>

                <hstack height="50px" width="100%" alignment="center middle" gap="small">
                    <button appearance="primary" onPress={onDialogClose}>OK</button>
                    {!isCompletedGame && <button appearance="primary" onPress={onCreatePost}>Create Post (+{SHARE_XP_VALUE}XP)</button>}
                </hstack>
            </vstack>

            {scoreLoading && <ProgressIndicatorComponent />}
        </zstack>
    );
};

export default VictoryDialogComponent;
