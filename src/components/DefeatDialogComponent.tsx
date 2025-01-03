import { Devvit, RedditAPIClient, RedisClient, useState, useAsync } from '@devvit/public-api';
import { UserModel } from '../models/UserModel.js';
import ProgressIndicatorComponent from './ProgressIndicatorComponent.js';
import { calculateLevelProgress } from '../utils/user_utils.js';
import { formatTime } from '../utils/time_utils.js';

const TEXT_COLOR = '#000000';
const DEFEAT_XP_VALUE = 5;

interface DefeatDialogProps {
    onDialogClose: () => void;
    user: UserModel;
    totalTime: number;
    redisClient: RedisClient;
    postData: Record<string, string> | undefined;
}

export function DefeatDialogComponent({ onDialogClose, totalTime, user, redisClient, postData }: DefeatDialogProps) {
    const { data: userData, loading: scoreLoading, error: scoreError } = useAsync(async () => {
        let currentUser = user;
        currentUser.loseRate += 1;
        currentUser.currentXP += DEFEAT_XP_VALUE;

        await redisClient.hSet(`userDetails:${currentUser.id}`, {
            xpValue: currentUser.currentXP.toString(),
            winRate: currentUser.winRate.toString(),
            loseRate: currentUser.loseRate.toString(),
            recordsWon: currentUser.recordsWon.toString(),
        });

        if (postData?.subpostID != null) {
            const subpostID = postData?.subpostID;
            currentUser.lostSubposts.push(subpostID);

            await redisClient.hSet(`subpost:${subpostID}`, {
                subpostID: subpostID,
                totalTime: postData.totalTime.toString(),
                gameSeed: postData.gameSeed,
                userID: postData.userID,
                victoriesNumber: postData.victoriesNumber,
                defeatsNumber: (Number(postData.defeatsNumber ?? 0) + 1).toString(),
                ownerInfoString: postData.ownerInfoString,
            });

            await redisClient.del(`lostSubposts:${currentUser.id}`);
            const members = currentUser.lostSubposts.map((game, index) => ({ score: index, member: game }));
            await redisClient.zAdd(`lostSubposts:${currentUser.id}`, ...members);
        }

        return currentUser;
    });

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
                url='interface_background/small_dialog_background.png'
                description='Dialog background'
                imageHeight={410}
                imageWidth={410}
                resizeMode='none'
            />

            <vstack height="100%" width="400px" alignment="center middle" gap="small">
                <text size="xxlarge" weight="bold" color={TEXT_COLOR} selectable={false}>Defeat +{DEFEAT_XP_VALUE}XP</text>
                {postData?.subpostID == null && <text size="xlarge" weight="bold" color={TEXT_COLOR} selectable={false}>Time: {formatTime(totalTime)}</text>}

                <hstack width="100%" alignment="center middle" gap="medium">
                    <text size="medium" color={TEXT_COLOR} selectable={false}>LVL: {scoreLoading ? "-" : calculateLevelProgress((userData ?? user).currentXP).level}</text>
                    <text size="medium" color={TEXT_COLOR} selectable={false}>XP: {scoreLoading ? "-" : (userData ?? user).currentXP}</text>
                    <text size="medium" color={TEXT_COLOR} selectable={false}>Next Level: {scoreLoading ? "-" : calculateLevelProgress((userData ?? user).currentXP).xpToNextLevel}</text>
                </hstack>

                {postData?.subpostID == null ?
                    (<text width="310px" size="medium" color={TEXT_COLOR} alignment="center middle" wrap={true} selectable={false}>No more moves are available! Unfortunately, this means the game has come to an end. Better luck next time!</text>)
                    : (<text width="310px" size="medium" color={TEXT_COLOR} alignment="center middle" wrap={true} selectable={false}>Unfortunately, your time has run out</text>)}

                <image url='buttons/b_ok.png' description='Ok button' imageHeight={40} imageWidth={41} resizeMode='none' onPress={onDialogClose} />
            </vstack>

            {scoreLoading && <ProgressIndicatorComponent isDarkBackground={false} />}
        </zstack>
    );
};

export default DefeatDialogComponent;
