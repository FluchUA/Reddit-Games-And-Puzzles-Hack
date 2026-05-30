import { useState, useEffect } from 'react';
import { UserModel } from '../../shared/models/UserModel';
import { LoadingComponent } from './LoadingComponent';
import { calculateLevelProgress } from '../utils/user_utils';
import { formatTime } from '../utils/time_utils';

const DEFEAT_XP_VALUE = 5;

interface DefeatDialogProps {
    onDialogClose: () => void;
    user: UserModel;
    totalTime: number;
    postData: Record<string, string> | undefined;
}

export function DefeatDialogComponent({ onDialogClose, totalTime, user, postData }: DefeatDialogProps) {
    const [userData, setUserData] = useState<UserModel | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/defeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postData }),
        })
            .then(res => res.json())
            .then(data => setUserData(data.user))
            .finally(() => setLoading(false));
    }, []);

    const displayUser = userData ?? user;
    const levelProgress = calculateLevelProgress(displayUser.currentXP);

    return (
        <div className="modal-overlay">

            {/* Dialog Background */}
            <div className="modal-dialog-box small-dialog">

                {/* Content */}
                <div className="modal-dialog-content">

                    {/*Title */}
                    <h2 className="text-xlarge bold-text"> Defeat +{DEFEAT_XP_VALUE}XP </h2>

                    {/* Time Value */}
                    {postData?.subpostID == null && (<p className="text-medium bold-text"> Time: {formatTime(totalTime)}  </p>)}

                    {/* Stats */}
                    <div className="stats-row text-small  margin-top-small margin-bottom-small">
                        <span>LVL: {loading ? '-' : levelProgress.level}</span>
                        <span>XP: {loading ? '-' : displayUser.currentXP}</span>
                        <span>Next Level: {loading ? '-' : levelProgress.xpToNextLevel}</span>
                    </div>

                    {/* Description */}
                    <p className="text-small">
                        {postData?.subpostID == null
                            ? 'No more moves are available! Unfortunately, this means the game has come to an end. Better luck next time!'
                            : 'Unfortunately, your time has run out'}
                    </p>

                    {/* OK Button */}
                    <img src="/buttons/b_ok.png" alt="Ok" className="clickable-button btn-ok" onClick={onDialogClose} />
                </div>
            </div>

            {/* Spinner */}
            {loading && <LoadingComponent isShowBackgroundImage={true} />}
        </div>
    );
}

export default DefeatDialogComponent;