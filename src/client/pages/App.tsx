import { useState, useEffect } from 'react';
import { MainMenuPage } from './MainMenuPage';
import { CreateGamePage } from './CreateGamePage';
import { SubpostPage } from './SubpostPage';
import { CreateGameBySeedPage } from './CreateGameBySeedPage';
import { GamePage } from './GamePage';
import { UserModel } from '../../shared/models/UserModel';
import { LoadingComponent } from '../components/LoadingComponent';
import { PageType } from '../enums/PageType';
import { PlayingCard } from '../models/PlayingCard';
import { CardRank } from '../enums/CardRank';
import { CardSuit } from '../enums/CardSuit';

import seedrandom from 'seedrandom';

export function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<UserModel>(new UserModel());
    const [postData, setPostData] = useState<Record<string, string>>({});

    const [screen, setScreen] = useState<PageType>(PageType.None);
    const [seed, setSeed] = useState<string>("");
    const [columns, setColumns] = useState<PlayingCard[][]>([]);
    const [isCompletedGame, setIsCompletedGame] = useState<boolean>(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    /// Get User
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

                setUserData(u);
                setPostData(data.postData);
            } catch (error) {
                console.error('Failed to load:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [refetchTrigger]);

    if ((screen === PageType.None || screen === PageType.MainMenu) && postData != null && postData.gameSeed != null) {
        setScreen(PageType.Subpost);
    } else if (screen === PageType.None) {
        setScreen(PageType.MainMenu);
    }

    /// Creates a deck according to a given seed of the game
    function onStartGame(gameSeed: string) {
        let currentSeed = gameSeed;
        if (!gameSeed.match(/[^-]/)) {
            let uniqueSeed: string = "000000";
            let isUnique = false;

            while (!isUnique) {
                uniqueSeed = Math.floor(Math.random() * 1000000).toString();

                // Checking if the generated grain is unique
                isUnique = !userData.completedGames.includes(uniqueSeed);
            }
            currentSeed = uniqueSeed;
        }

        let formatedSeed = currentSeed.replace(/[^0-9]/g, "");
        setSeed(formatedSeed);
        setIsCompletedGame(userData.completedGames.includes(formatedSeed))
        const random = seedrandom(formatedSeed);

        // Playing cards
        const deck: PlayingCard[] = [];
        for (const suit of Object.values(CardSuit)) {
            for (const rank of Object.values(CardRank)) {
                deck.push({
                    suit,
                    rank,
                    isRed: suit == CardSuit.Hearts || suit == CardSuit.Diamonds,
                    isSelected: false,
                    isInFreeCell: false,
                    columnPosition: 0,
                    assetPath: `cards/card_${suit}_${rank}.png`,
                    cardLvlPath: "card_levels/card_level_1.png",
                });
            }
        }

        // Card level calculation
        const shuffledDeck = [...deck].sort(() => random() - 0.5);

        const recordsWon = userData.recordsWon > 208 ? 208 : userData.recordsWon;
        let generalCardLevel = Math.ceil(recordsWon / 52);
        const newLvlCardCount = recordsWon - Math.floor(recordsWon / 52) * 52;
        generalCardLevel = generalCardLevel == 0 ? 1 : generalCardLevel;

        for (let i = 0; i < shuffledDeck.length; i++) {
            let shuffledDeckItem = shuffledDeck[i];
            if (shuffledDeckItem) {
                shuffledDeckItem.cardLvlPath = `card_levels/card_level_${i < newLvlCardCount ? generalCardLevel + 1 : generalCardLevel}.png`;
            }
        }

        let newCardColumns: PlayingCard[][] = Array.from({ length: 8 }, () => []);
        for (let i = 0; i < newCardColumns.length; i++) {
            for (let j = 0; j < (i < 4 ? 7 : 6); j++) {
                const randomIndex = Math.floor(random() * shuffledDeck.length);
                const [card] = shuffledDeck.splice(randomIndex, 1);
                if (card) newCardColumns[i]?.push(card);
            }
        }

        setColumns(newCardColumns);
        setScreen(PageType.Game)
    };

    return (
        <div className="main-container">
            {screen === PageType.Subpost && (
                <SubpostPage
                    user={userData}
                    postData={postData}
                    onStartGame={onStartGame}
                />
            )}
            {screen === PageType.MainMenu && userData && (
                <MainMenuPage
                    user={userData}
                    onStartGame={() => setScreen(PageType.CreateGame)}
                />
            )}
            {screen === PageType.CreateGame && (
                <CreateGamePage
                    onBackToMenu={() => setScreen(PageType.MainMenu)}
                    onOpenCreateBySeedPage={() => setScreen(PageType.CreateGameBySeed)}
                    onStartGame={onStartGame}
                />
            )}
            {screen === PageType.CreateGameBySeed && (
                <CreateGameBySeedPage
                    onBackToMenu={() => setScreen(PageType.MainMenu)}
                    onStartGame={onStartGame}
                />
            )}
            {screen === PageType.Game && (
                <GamePage
                    gameSeed={seed}
                    user={userData}
                    isCompletedGame={isCompletedGame}
                    postData={postData}
                    cards={columns}
                    onBackToMenu={() => {
                        setScreen(PageType.MainMenu);
                        setRefetchTrigger(prev => prev + 1);
                        setIsLoading(true);
                    }}
                />
            )}

            {/* Spinner */}
            {isLoading && (<LoadingComponent isShowBackgroundImage={true} />)}
        </div>
    );
}