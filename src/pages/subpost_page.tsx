import { Devvit } from '@devvit/public-api';
import { formatTime } from '../utils/time_utils.js';
import { UserModel } from '../models/UserModel.js';

const TEXT_COLOR = '#000000';

interface SubpostPageProps {
    user: UserModel;
    postData: Record<string, string> | undefined;
    onStartGame: (seed: string) => void;
}

export function SubpostPage({ user, postData, onStartGame }: SubpostPageProps) {
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

            {postData != undefined && <vstack height="100%" width="310px" alignment="center middle" gap="small">
                {user.id == postData?.userID ? (
                    <vstack height="200px" width="300px" alignment="center middle" gap="small">
                        <text size="xxlarge" alignment="center middle" color={TEXT_COLOR} height="30px">Your result: {formatTime(Number(postData.totalTime))}</text>
                        <text size="xlarge" alignment="center middle" color={TEXT_COLOR} wrap={true}>You've already challenged others to beat it!</text>
                        <text size="medium" alignment="center middle" color={TEXT_COLOR} wrap={true}>Now sit back and see if anyone can rise to the challenge.</text>
                    </vstack>
                ) : user.wonSubposts.includes(postData.subpostID) ? (
                    <vstack height="200px" width="300px" alignment="center middle" gap="small">
                        <text size="xxlarge" alignment="center middle" color={TEXT_COLOR} height="30px">Congratulations!</text>
                        <text size="xlarge" alignment="center middle" color={TEXT_COLOR} wrap={true}>You’ve conquered this challenge and claimed victory. See you in the next challenge!</text>
                        <text size="medium" alignment="center middle" color={TEXT_COLOR} wrap={true}>Received +300XP +1 card level upgrade</text>
                    </vstack>
                ) : user.lostSubposts.includes(postData.subpostID) ? (
                    <vstack height="130px" width="300px" alignment="center middle" gap="small">
                        <text size="xlarge" alignment="center middle" color={TEXT_COLOR} wrap={true}>Unfortunately, you didn’t win this time, but don’t give up! Learn from this and come back stronger—you’ve got what it takes to succeed!</text>
                    </vstack>
                ) : (
                    <vstack height="200px" width="300px" alignment="center middle" gap="small">
                        <text size="xxlarge" weight="bold" color={TEXT_COLOR}>Player {postData.ownerInfoString}LVL</text>
                        <text size="xxlarge" weight="bold" color={TEXT_COLOR}>has set a new time record!</text>
                        <text size="xxlarge" weight="bold" color={TEXT_COLOR} height="50px">{formatTime(Number(postData.totalTime))}</text>
                        <text size="xxlarge" alignment="center middle" color={TEXT_COLOR}>Think you can beat it?</text>
                        <text size="medium" alignment="center middle" color={TEXT_COLOR} wrap={true}>Finish the game faster to earn XP and gain a +1 upgrade to your card level</text>
                    </vstack>
                )}

                <hstack width="100%" height="50px" alignment="center top" gap="small">
                    <text size="medium" color={TEXT_COLOR}>Winning players: {Number(postData.victoriesNumber)}</text>
                    <text size="medium" color={TEXT_COLOR}>Defeated Players: {Number(postData.defeatsNumber)}</text>
                </hstack>

                {!user.wonSubposts.includes(postData.subpostID)
                    && !user.lostSubposts.includes(postData.subpostID)
                    && <button appearance="primary" onPress={() => onStartGame(postData.gameSeed)}>Enter the Challenge</button>}
            </vstack>}
        </zstack>
    );
}