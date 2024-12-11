// Learn more at developers.reddit.com/docs
import { Devvit, useState } from '@devvit/public-api';

import { PageType } from './enums/PageType.js';
import { PlayingCard } from './models/PlayingCard.js';

import { MainMenuPage } from './pages/main_menu_page.js';
import { GamePage } from './pages/game_page.js';
import { CreateGamePage } from './pages/create_game_page.js';

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
      title: 'My devvit post',
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
    const [screen, setScreen] = useState<PageType>(PageType.MainMenu);
    const [columns, setColumns] = useState<PlayingCard[][]>([]);

    const onStartGame = (cards: PlayingCard[][]) => {
      setColumns(cards);
      setScreen(PageType.Game)
    };

    return (
      <zstack height="100%" width="100%" gap="medium" alignment="center middle">
        {screen === PageType.MainMenu && <MainMenuPage onStartGame={() => setScreen(PageType.CreateGame)} />}
        {screen === PageType.CreateGame && <CreateGamePage onBackToMenu={() => setScreen(PageType.MainMenu)} onStartGame={(cards: PlayingCard[][]) => onStartGame(cards)} />}
        {screen === PageType.Game && <GamePage cards={columns} onBackToMenu={() => setScreen(PageType.MainMenu)} />}
      </zstack>
    );
  },
});

export default Devvit;
