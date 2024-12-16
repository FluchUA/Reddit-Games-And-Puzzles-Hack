import { Devvit, Context, useAsync, RedditAPIClient, RedisClient, useState } from '@devvit/public-api';
import { UserModel } from '../models/UserModel.js';
import ProgressIndicatorComponent from './ProgressIndicatorComponent.js';

import { calculateLevelProgress } from '../utils/user_utils.js';
import { formatTime } from '../utils/time_utils.js';

const TEXT_COLOR = '#000000';

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
    const [userModel, setUser] = useState<UserModel>(user);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const { data: userData, loading: scoreLoading, error: scoreError } = useAsync(async () => {
        let currentUser: UserModel | null = null;
        if (!isCompletedGame) {
            currentUser = userModel;
            currentUser.winRate += 1;
            currentUser.currentXP += 300;
            currentUser.completedGames.push(gameSeed);

            await redisClient.hSet(`userDetails:${currentUser.id}`, {
                xpValue: currentUser.currentXP.toString(),
                winRate: currentUser.winRate.toString(),
                loseRate: currentUser.loseRate.toString(),
            });

            // Clear existing games for this user
            await redisClient.del(`completedGames:${currentUser.id}`);
            // // Add all games to the sorted set with scores as indices
            const members = currentUser.completedGames.map((game, index) => ({ score: index, member: game }));
            await redisClient.zAdd(`completedGames:${currentUser.id}`, ...members);
        }

        return currentUser;
    }, { depends: [refetchTrigger] });

    if (userData != null) {
        setUser(userData);
    }

    async function onCreatePost() {
        await redisClient.hSet(`userDetails:${userModel.id}`, {
            xpValue: (userModel.currentXP + 200).toString(),
            winRate: userModel.winRate.toString(),
            loseRate: userModel.loseRate.toString(),
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
                height="220px"
                width="320px"
                resizeMode='fill'
            />

            <vstack height="100%" width="400px" alignment="center middle" gap="small">
                <text size="xxlarge" weight="bold" color={TEXT_COLOR}>Victory{isCompletedGame ? "" : " +300XP"}</text>
                <text size="xlarge" weight="bold" color={TEXT_COLOR}>Time: {formatTime(totalTime)}</text>

                {isCompletedGame ? (
                    <vstack height="50px" width="100%" alignment="center middle" gap="small">
                        <text size="small" weight="bold" color={TEXT_COLOR}>Since you've already played this game,</text>
                        <text size="small" weight="bold" color={TEXT_COLOR}>you won't be earning experience points this time around</text>
                    </vstack>
                ) : (
                    <hstack width="100%" alignment="center middle" gap="medium">
                        <text size="medium" color={TEXT_COLOR}>LVL: {scoreLoading ? "-" : calculateLevelProgress(userModel.currentXP).level}</text>
                        <text size="medium" color={TEXT_COLOR}>XP: {scoreLoading ? "-" : userModel.currentXP}</text>
                        <text size="medium" color={TEXT_COLOR}>Next Level: {scoreLoading ? "-" : calculateLevelProgress(userModel.currentXP).xpToNextLevel}</text>
                    </hstack>
                )}

                <hstack height="50px" width="100%" alignment="center middle" gap="small">
                    <button appearance="primary" onPress={onDialogClose}>OK</button>
                    {!isCompletedGame && <button appearance="primary" onPress={onCreatePost}>Create Post (+200XP)</button>}
                </hstack>
            </vstack>

            {scoreLoading && <ProgressIndicatorComponent />}
        </zstack>
    );
};

export default VictoryDialogComponent;
