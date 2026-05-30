import { formatTime } from '../utils/time_utils';
import { UserModel } from '../../shared/models/UserModel';

interface SubpostPageProps {
    user: UserModel;
    postData: Record<string, string>;
    onStartGame: (seed: string) => void;
}

export function SubpostPage({ user, postData, onStartGame }: SubpostPageProps) {
    const subpostID = postData?.subpostID;
    const gameSeed = postData?.gameSeed;
    if (!subpostID || !gameSeed) return null;

    // Dynamic content rendering layer
    const renderContent = () => {
        // The challenge creator is watching
        if (user.id === postData.userID) {
            return (
                <>
                    <p className="text-xxlarge bold-text text-center text-black">Your result: {formatTime(Number(postData.totalTime))}</p>
                    <p className="text-medium bold-text text-center text-black">You've already challenged others to beat it!</p>
                    <p className="text-small text-center text-black margin-bottom-small">Now sit back and see if anyone can rise to the challenge.</p>
                </>
            );
        }

        // The player has already won this challenge
        if (user.wonSubposts.includes(subpostID)) {
            return (
                <>
                    <h2 className="text-xxlarge bold-text text-center text-black">Congratulations!</h2>
                    <p className="text-medium text-center text-black">You've conquered this challenge and claimed victory. See you in the next challenge!</p>
                    <p className="text-medium bold-text text-center text-black margin-top-small">Received +300XP +1 card level upgrade</p>
                </>
            );
        }

        // The player has already failed this challenge
        if (user.lostSubposts.includes(subpostID)) {
            return (
                <p className="text-xlarge bold-text text-center text-black margin-bottom-small">
                    Unfortunately, you didn't win this time, but don't give up! Learn from this and come back stronger—you've got what it takes to succeed!
                </p>
            );
        }

        // Default (new player)
        return (
            <>
                <p className="text-xxlarge bold-text text-center text-black">Player {postData.ownerInfoString}LVL</p>
                <p className="text-xxlarge bold-text text-center text-black">has set a new time record!</p>
                <p className="text-xxlarge bold-text text-center text-black">{formatTime(Number(postData.totalTime))}</p>
                <p className="text-xlarge text-center text-black">Think you can beat it?</p>
                <p className="text-medium text-center text-black margin-bottom-small">Finish the game faster to earn XP and gain +1 upgrade to your card level</p>
            </>
        );
    };

    const canEnterChallenge =
        !user.wonSubposts.includes(subpostID) &&
        !user.lostSubposts.includes(subpostID) &&
        user.id !== postData.userID;

    return (
        <div className="main-container">
            <img src="/background.png" alt="Background" className="bg-main" />
            <img src="/interface_background/dialog_background2.png" alt="Dialog background" className="bg-main-container" />

            {postData && (<div className="content-layer">
                {/* Dynamic Page Content */}
                {renderContent()}

                {/* Win/loss record for this subpost */}
                <div className="stats-row text-small text-black  margin-bottom-small">
                    <span>Winning players: {Number(postData.victoriesNumber)}</span>
                    <span>Defeated Players: {Number(postData.defeatsNumber)}</span>
                </div>

                {/* Challenge Entry Button */}
                {canEnterChallenge && (
                    <img src="/buttons/b_enter_chllenge.png" alt="Enter Challenge" className="clickable-button" onClick={() => onStartGame(gameSeed)} />
                )}
            </div>)}
        </div>
    );
}