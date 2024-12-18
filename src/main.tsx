import { Devvit, useAsync } from '@devvit/public-api';
import { ProgressIndicatorComponent } from './components/ProgressIndicatorComponent.js';
import { RouterPage } from './pages/router_page.js';

Devvit.configure({
  redis: true,
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
      title: 'A Moment of Calm with Every Move :)',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (<ProgressIndicatorComponent isDarkBackground={true} />),
    });
    ui.showToast({ text: 'Created post!' });
  },
});

const MyCustomPost: Devvit.CustomPostComponent = (context) => {

  const { data: combinedData, loading: scoreLoading, error: scoreError } = useAsync(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {};
  });

  return (<RouterPage context={context} />);
};

Devvit.addCustomPostType({
  name: 'Free Cell',
  height: 'tall',
  render: MyCustomPost,
});

export default Devvit;