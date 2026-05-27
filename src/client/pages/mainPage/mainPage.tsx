import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import { UserModel } from '../../../shared/models/UserModel';
import { LoadingComponent } from '../../components/LoadingComponent';
import { RulesDialogComponent } from '../../components/RulesDialogComponent';
import { calculateLevelProgress } from '../../utils/user_utils';

export function MainMenuPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isRulesShow, setIsRulesShow] = useState(false);
    const [user, setUser] = useState<UserModel | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {

                const res = await fetch('/api/get-user');
                const data = await res.json();

                sessionStorage.setItem('userModel', JSON.stringify(data.user));
                localStorage.setItem('postData', JSON.stringify(data.postData));

                const u = new UserModel(
                    data.user.id,
                    data.user.name,
                    data.user.currentXP,
                    data.user.winRate,
                    data.user.loseRate,
                    data.user.recordsWon,
                    data.user.wonSubposts,
                    data.user.lostSubposts,
                    data.user.completedGames,
                );

                setUser(u);
            } catch (error) {
                console.error('Failed to load:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (!user && !isLoading) {
        return;
    }

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
                <p className="text-xlarge text-center-top"> Let’s see what you can achieve today! </p>

                {/* XP*/}
                <div className="width-100 gap-small stats-row">
                    <span className="text-medium">XP: {user.currentXP}</span>
                    <span className="text-medium">Next Level: {xpToNextLevel}</span>
                </div>

                {/* Wins/Losses */}
                <div className="width-100 gap-small stats-row">
                    <span className="text-medium">Total Wins: {user.winRate}</span>
                    <span className="text-medium">Total Losses: {user.loseRate}</span>
                </div>

                {/* Buttons */}
                <div className="buttons-container gap-small">
                    <img src="/buttons/b_start_game.png" alt="Start Game button" className="clickable-button" onClick={() => console.log('start game')} />
                    <img src="/buttons/b_game_rules.png" alt="Game Rules button" className="clickable-button" onClick={() => setIsRulesShow(true)} />
                </div>
            </div>)}

            {/* Rules Dialog */}
            {isRulesShow && (<RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />)}

            {/* Spinner */}
            {isLoading && (<LoadingComponent />)}
        </div>
    );
}

createRoot(document.getElementById('root')!).render(<StrictMode> <MainMenuPage /> </StrictMode>);
