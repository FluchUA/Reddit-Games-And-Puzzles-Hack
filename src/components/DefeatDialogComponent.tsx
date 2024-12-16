import { Devvit, RedditAPIClient, RedisClient, useState, useAsync } from '@devvit/public-api';
import { UserModel } from '../models/UserModel.js';
import ProgressIndicatorComponent from './ProgressIndicatorComponent.js';
import { calculateLevelProgress } from '../utils/user_utils.js';
import { formatTime } from '../utils/time_utils.js';

const TEXT_COLOR = '#000000';

interface DefeatDialogProps {
    onDialogClose: () => void;
    user: UserModel;
    totalTime: number;
    redditClient: RedditAPIClient;
    redisClient: RedisClient;
}

export function DefeatDialogComponent({ onDialogClose, totalTime, user, redditClient, redisClient }: DefeatDialogProps) {
    const [userModel, setUser] = useState<UserModel>(user);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const { data: userData, loading: scoreLoading, error: scoreError } = useAsync(async () => {
        let currentUser = userModel;
        currentUser.loseRate += 1;
        currentUser.currentXP += 5;

        await redisClient.hSet(`userDetails:${currentUser.id}`, {
            xpValue: currentUser.currentXP.toString(),
            winRate: currentUser.winRate.toString(),
            loseRate: currentUser.loseRate.toString(),
        });

        return currentUser;
    }, { depends: [refetchTrigger] });

    if (userData != null) {
        setUser(userData);
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
                <text size="xxlarge" weight="bold" color={TEXT_COLOR}>Defeat +5XP</text>
                <text size="xlarge" weight="bold" color={TEXT_COLOR}>Time: {formatTime(totalTime)}</text>

                <hstack width="100%" alignment="center middle" gap="medium">
                    <text size="medium" color={TEXT_COLOR}>LVL: {scoreLoading ? "-" : calculateLevelProgress(userModel.currentXP).level}</text>
                    <text size="medium" color={TEXT_COLOR}>XP: {scoreLoading ? "-" : userModel.currentXP}</text>
                    <text size="medium" color={TEXT_COLOR}>Next Level: {scoreLoading ? "-" : calculateLevelProgress(userModel.currentXP).xpToNextLevel}</text>
                </hstack>
                <text width="310px" size="medium" color={TEXT_COLOR} wrap={true}>No more moves are available! Unfortunately, this means the game has come to an end. Better luck next time!</text>

                <button appearance="primary" onPress={onDialogClose}>OK</button>
            </vstack>

            {scoreLoading && <ProgressIndicatorComponent />}
        </zstack>
    );
};

export default DefeatDialogComponent;
