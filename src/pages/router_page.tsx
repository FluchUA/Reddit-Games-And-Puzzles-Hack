import { Devvit, RedditAPIClient, RedisClient, useState, useAsync } from '@devvit/public-api';

import { PlayingCard } from '../models/PlayingCard.js';
import { UserModel } from '../models/UserModel.js';

import { PageType } from '../enums/PageType.js';
import { CardRank } from '../enums/CardRank.js';
import { CardSuit } from '../enums/CardSuit.js';

import { MainMenuPage } from '../pages/main_menu_page.js';
import { GamePage } from '../pages/game_page.js';
import { CreateGamePage } from '../pages/create_game_page.js';
import { CreateGameBySeedPage } from '../pages/create_game_by_seed_page.js';
import { SubpostPage } from '../pages/subpost_page.js';

import ProgressIndicatorComponent from '../components/ProgressIndicatorComponent.js';

import seedrandom from 'seedrandom';

interface RouterPageProps {
    context: Devvit.Context
}

export function RouterPage({ context }: RouterPageProps) {
    const [user, setUser] = useState<UserModel>(new UserModel());
    const [seed, setSeed] = useState<string>("");
    const [isCompletedGame, setIsCompletedGame] = useState<boolean>(false);
    const [screen, setScreen] = useState<PageType>(PageType.None);
    const [columns, setColumns] = useState<PlayingCard[][]>([]);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    const { data: combinedData, loading: scoreLoading, error: scoreError } = useAsync(async () => {
        const userData = await context.reddit.getCurrentUser();
        if (userData != null) {
            const userDetails = await context.redis.hGetAll(`userDetails:${userData.id}`);
            const completedGames = await context.redis.zRange(`completedGames:${userData.id}`, 0, -1);
            const wonSubposts = await context.redis.zRange(`wonSubposts:${userData.id}`, 0, -1);
            const lostSubposts = await context.redis.zRange(`lostSubposts:${userData.id}`, 0, -1);

            user.id = userData.id;
            user.name = userData.username;
            user.completedGames = completedGames.map(item => item.member);
            user.wonSubposts = wonSubposts.map(item => item.member);
            user.lostSubposts = lostSubposts.map(item => item.member);

            if (userDetails != null) {
                user.currentXP = Number(userDetails.xpValue ?? 0);
                user.winRate = Number(userDetails.winRate ?? 0);
                user.loseRate = Number(userDetails.loseRate ?? 0);
                user.recordsWon = Number(userDetails.recordsWon ?? 0);
            }
        }

        /// get post game results
        const postData = await context.redis.hGetAll(`subpost:${context.postId}`);

        return { user, postData };
    }, { depends: [refetchTrigger] });

    if ((screen === PageType.None || screen === PageType.MainMenu) && combinedData?.postData?.gameSeed != null) {
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
                isUnique = !(combinedData?.user ?? user).completedGames.includes(uniqueSeed);
            }
            currentSeed = uniqueSeed;
        }

        let formatedSeed = currentSeed.replace(/[^0-9]/g, "");
        setSeed(formatedSeed);
        setIsCompletedGame((combinedData?.user ?? user).completedGames.includes(formatedSeed))
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
                    dustAnimationState: 0,
                });
            }
        }

        // Card level calculation
        const shuffledDeck = [...deck].sort(() => random() - 0.5);
        const recordsWon = (combinedData?.user ?? user).recordsWon > 208 ? 208 : (combinedData?.user ?? user).recordsWon;
        const generalCardLevel = Math.ceil(recordsWon / 52);
        const newLvlCardCount = recordsWon - Math.floor(recordsWon / 52) * 52;
        
        for (let i = 0; i < shuffledDeck.length; i++) {
            shuffledDeck[i].cardLvlPath = `card_levels/card_level_${generalCardLevel + (i < newLvlCardCount ? 1 : 0)}.png`;
        }

        let newCardColumns: PlayingCard[][] = Array.from({ length: 8 }, () => []);
        for (let i = 0; i < newCardColumns.length; i++) {
            for (let j = 0; j < (i < 4 ? 7 : 6); j++) {
                const randomIndex = Math.floor(random() * shuffledDeck.length);
                const [card] = shuffledDeck.splice(randomIndex, 1);
                newCardColumns[i].push(card);
            }
        }

        setColumns(newCardColumns);
        setScreen(PageType.Game)
    };

    return (
        <zstack height="100%" width="100%" gap="medium" alignment="center middle">
            {screen === PageType.Subpost && <SubpostPage
                user={combinedData?.user ?? user}
                postData={combinedData?.postData}
                onStartGame={(seed: string) => onStartGame(seed)}
            />}
            {screen === PageType.MainMenu && <MainMenuPage
                user={combinedData?.user ?? user}
                onStartGame={() => setScreen(PageType.CreateGame)}
            />}
            {screen === PageType.Game && <GamePage
                gameSeed={seed}
                user={combinedData?.user ?? user}
                isCompletedGame={isCompletedGame}
                postData={combinedData?.postData}
                cards={columns}
                onBackToMenu={() => {
                    setScreen(PageType.MainMenu);
                    setRefetchTrigger(prev => prev + 1);
                }}
                redditClient={context.reddit}
                redisClient={context.redis}
            />}
            {screen === PageType.CreateGameBySeed && <CreateGameBySeedPage
                onBackToMenu={() => setScreen(PageType.MainMenu)}
                onStartGame={(seed: string) => onStartGame(seed)}
            />}
            {screen === PageType.CreateGame && <CreateGamePage
                onBackToMenu={() => setScreen(PageType.MainMenu)}
                onOpenCreateBySeedPage={() => setScreen(PageType.CreateGameBySeed)}
                onStartGame={(seed: string) => onStartGame(seed)}
            />}

            {scoreLoading && <ProgressIndicatorComponent />}
        </zstack>
    );
}