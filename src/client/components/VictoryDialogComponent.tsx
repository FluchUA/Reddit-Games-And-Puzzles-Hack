import { useEffect, useState } from 'react';
import { formatTime } from '../utils/time_utils.js';
import { calculateLevelProgress } from '../utils/user_utils.js';
import { UserModel } from '../../shared/models/UserModel';
import { LoadingComponent } from './LoadingComponent.js';

const VICTORY_XP_VALUE = 300;
const SECOND_VICTORY_XP_VALUE = 15;

interface VictoryDialogProps {
    onDialogClose: () => void;
    totalTime: number;
    gameSeed: string;
    isCompletedGame: boolean;
    user: UserModel;
    postData: Record<string, string> | undefined;
}

export function VictoryDialogComponent({
    onDialogClose,
    totalTime,
    gameSeed,
    isCompletedGame,
    user,
    postData,
}: VictoryDialogProps) {
    const [userData, setUserData] = useState<UserModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/victory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                gameSeed,
                isCompletedGame,
                postData,
            }),
        })
            .then(res => res.json())
            .then(data => setUserData(data.user))
            .finally(() => setLoading(false));
    }, []);

    async function onCreatePost() {
        const currentUser = userData ?? user;
        const { level } = calculateLevelProgress(currentUser.currentXP);

        await fetch('/api/create-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                totalTime,
                gameSeed,
                currentXP: currentUser.currentXP,
                winRate: currentUser.winRate,
                loseRate: currentUser.loseRate,
                recordsWon: currentUser.recordsWon,
                ownerInfoString: `${currentUser.name} ${level}`,
            }),
        });

        onDialogClose();
    }

    const displayUser = userData ?? user;
    const { level, xpToNextLevel } = calculateLevelProgress(displayUser.currentXP);

    return (
        <div className="modal-overlay">

            {/* Dialog Background */}
            <div className="modal-dialog-box small-dialog">

                {/* Content */}
                <div className="modal-dialog-content">

                    {/* Title */}
                    <h2 className="text-xlarge bold-text"> Victory +{isCompletedGame ? SECOND_VICTORY_XP_VALUE : VICTORY_XP_VALUE}XP </h2>

                    {/* Time Value */}
                    <p className="text-small bold-text"> Time: {formatTime(totalTime)} </p>

                    {/* Description */}
                    {isCompletedGame && (<p className="text-small margin-top-small margin-bottom-small"> Since you've already played this game, you've received a reduced amount of experience points</p>)}

                    {/* Stats */}
                    <div className="stats-row text-small">
                        <span>LVL: {loading ? '-' : level}</span>
                        <span>XP: {loading ? '-' : displayUser.currentXP}</span>
                        <span>Next Level: {loading ? '-' : xpToNextLevel}</span>
                    </div>
                </div>

                {/* Buttons */}
                <div className="buttons-container">
                    {!isCompletedGame && postData?.subpostID == null && (
                        <img src="/buttons/b_create_post.png" alt="Create post button" className="clickable-button" onClick={onCreatePost} />
                    )}
                    <img src="/buttons/b_ok.png" alt="Ok button" className="clickable-button" onClick={onDialogClose} />
                </div>
            </div>

            {/* Spinner */}
            {loading && <LoadingComponent isShowBackgroundImage={false} />}
        </div>
    );
}

export default VictoryDialogComponent;