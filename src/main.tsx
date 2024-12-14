// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';

import { PageType } from './enums/PageType.js';
import { PlayingCard } from './models/PlayingCard.js';
import { CardRank } from './enums/CardRank.js';
import { CardSuit } from './enums/CardSuit.js';

import { MainMenuPage } from './pages/main_menu_page.js';
import { GamePage } from './pages/game_page.js';
import { CreateGamePage } from './pages/create_game_page.js';
import { CreateGameBySeedPage } from './pages/create_game_by_seed_page.js';

import seedrandom from 'seedrandom';

Devvit.configure({
  redditAPI: true,
});

// Add a menu item to the subreddit menu for instantiating the new experience post
Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    await reddit.submitPost({
      title: 'A Moment of Calm with Every Move',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.showToast({ text: 'Created post!' });
  },
});

Devvit.addCustomPostType({
  name: 'Free Cell',
  height: 'tall',
  render: () => {
    const [seed, setSeed] = useState<string>("");
    const [screen, setScreen] = useState<PageType>(PageType.MainMenu);
    const [columns, setColumns] = useState<PlayingCard[][]>([]);

    function onStartGame(gameSeed: string) {
      let currentSeed = gameSeed;
      if (!gameSeed.match(/[^-]/)) {
        const randomNumber = Math.floor(Math.random() * 1000000);
        const generatedSeed = randomNumber.toString().padEnd(6, '-');
        currentSeed = generatedSeed;
      }
      setSeed(currentSeed.replace(/[^0-9]/g, ""));
      const random = seedrandom(currentSeed);

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
            dustAnimationState: 0,
          });
        }
      }

      let newCardColumns: PlayingCard[][] = Array.from({ length: 8 }, () => []);
      for (let i = 0; i < newCardColumns.length; i++) {
        for (let j = 0; j < (i < 4 ? 7 : 6); j++) {
          const randomIndex = Math.floor(random() * deck.length);
          const [card] = deck.splice(randomIndex, 1);
          newCardColumns[i].push(card);
        }
      }

      setColumns(newCardColumns);
      setScreen(PageType.Game)
    };

    return (
      <zstack height="100%" width="100%" gap="medium" alignment="center middle">
        {screen === PageType.MainMenu && <MainMenuPage onStartGame={() => setScreen(PageType.CreateGame)} />}
        {screen === PageType.Game && <GamePage gameSeed={seed} cards={columns} onBackToMenu={() => setScreen(PageType.MainMenu)} />}
        {screen === PageType.CreateGameBySeed && <CreateGameBySeedPage
          onBackToMenu={() => setScreen(PageType.MainMenu)}
          onStartGame={(seed: string) => onStartGame(seed)}
        />}
        {screen === PageType.CreateGame && <CreateGamePage
          onBackToMenu={() => setScreen(PageType.MainMenu)}
          onOpenCreateBySeedPage={() => setScreen(PageType.CreateGameBySeed)}
          onStartGame={(seed: string) => onStartGame(seed)}
        />}
      </zstack>
    );
  },
});

export default Devvit;
