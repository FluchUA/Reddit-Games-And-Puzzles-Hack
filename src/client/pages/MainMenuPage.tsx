import { useState } from 'react';
import { UserModel } from '../../shared/models/UserModel';
import { calculateLevelProgress } from '../utils/user_utils';
import { RulesDialogComponent } from '../components/RulesDialogComponent';

interface MainMenuPageProps {
    user: UserModel;
    onStartGame: () => void;
}

export function MainMenuPage({ user, onStartGame }: MainMenuPageProps) {
    const [isRulesShow, setIsRulesShow] = useState(false);

    const { level, xpToNextLevel } = user
        ? calculateLevelProgress(user.currentXP)
        : { level: 0, xpToNextLevel: 0 };

    return (
        <div className="main-container">
            {/* Background */}
            <img src="/background.png" alt="Background" className="bg-main" />
            <img src="/interface_background/dialog_background1.png" alt="Dialog background" className="bg-main-container" />

            {/* Content */}
            {user && (<div className="content-layer">
                <h1 className="text-xxlarge">  Hi, {user.name}! {level}LVL </h1>
                <p className="text-xlarge text-center-top margin-bottom-small"> Let’s see what you can achieve today! </p>

                {/* XP*/}
                <div className="width-100 stats-row">
                    <span className="text-medium">XP: {user.currentXP}</span>
                    <span className="text-medium">Next Level: {xpToNextLevel}</span>
                </div>

                {/* Wins/Losses */}
                <div className="width-100 stats-row">
                    <span className="text-medium">Total Wins: {user.winRate}</span>
                    <span className="text-medium">Total Losses: {user.loseRate}</span>
                </div>

                {/* Buttons */}
                <div className="buttons-container">
                    <img src="/buttons/b_start_game.png" alt="Start Game button" className="clickable-button-medium" onClick={onStartGame} />
                    <img src="/buttons/b_game_rules.png" alt="Game Rules button" className="clickable-button-medium" onClick={() => setIsRulesShow(true)} />
                </div>
            </div>)}

            {/* Rules Dialog */}
            {isRulesShow && (<RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />)}
        </div>
    );
}