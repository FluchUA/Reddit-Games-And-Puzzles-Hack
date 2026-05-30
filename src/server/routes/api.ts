import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  UserRepsonse,
  UserDefeatResponse,
  UserVictoryResponse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

/// GET USER
api.get('/get-user', async (c) => {
  const body = await c.req.json();
  const { userId, postId } = body;

  if (!userId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'User not found',
      },
      400
    );
  }

  // Retrieving user data from the Reddit API
  const userData = await reddit.getCurrentUser();

  // Retrieve all the data from Redis
  const [userDetails, completedGames, wonSubposts, lostSubposts, postData] = await Promise.all([
    redis.hGetAll(`userDetails:${userId}`),
    redis.zRange(`completedGames:${userId}`, 0, -1),
    redis.zRange(`wonSubposts:${userId}`, 0, -1),
    redis.zRange(`lostSubposts:${userId}`, 0, -1),
    redis.hGetAll(`subpost:${postId}`),
  ]);

  const user = {
    id: userId,
    name: userData?.username ?? 'Anonymous',
    currentXP: Number(userDetails?.xpValue ?? 0),
    winRate: Number(userDetails?.winRate ?? 0),
    loseRate: Number(userDetails?.loseRate ?? 0),
    recordsWon: Number(userDetails?.recordsWon ?? 0),
    completedGames: (completedGames ?? []).map(item => item.member),
    wonSubposts: (wonSubposts ?? []).map(item => item.member),
    lostSubposts: (lostSubposts ?? []).map(item => item.member),
  };

  return c.json<UserRepsonse>({
    user: user,
    postData: postData,
  });
});

/// DEFEAT GAME
api.post('/defeat', async (c) => {
  const body = await c.req.json();
  const { postData } = body;

  const DEFEAT_XP_VALUE = 5;

  const redditUser = await reddit.getCurrentUser();
  if (!redditUser) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Not logged in',
      },
      401
    );
  }

  const userDetails = await redis.hGetAll(`userDetails:${redditUser.id}`);

  const currentXP = Number(userDetails?.xpValue ?? 0) + DEFEAT_XP_VALUE;
  const loseRate = Number(userDetails?.loseRate ?? 0) + 1;

  await redis.hSet(`userDetails:${redditUser.id}`, {
    xpValue: currentXP.toString(),
    winRate: userDetails?.winRate ?? '0',
    loseRate: loseRate.toString(),
    recordsWon: userDetails?.recordsWon ?? '0',
  });

  if (postData?.subpostID != null) {
    const subpostID = postData.subpostID;

    await redis.hSet(`subpost:${subpostID}`, {
      subpostID,
      totalTime: postData.totalTime.toString(),
      gameSeed: postData.gameSeed,
      userID: postData.userID,
      victoriesNumber: postData.victoriesNumber,
      defeatsNumber: (Number(postData.defeatsNumber ?? 0) + 1).toString(),
      ownerInfoString: postData.ownerInfoString,
    });

    const lostSubposts = await redis.zRange(`lostSubposts:${redditUser.id}`, 0, -1);
    const updatedLost = [...lostSubposts.map(i => i.member), subpostID];

    await redis.del(`lostSubposts:${redditUser.id}`);
    const members = updatedLost.map((game, index) => ({ score: index, member: game }));
    await redis.zAdd(`lostSubposts:${redditUser.id}`, ...members);
  }

  /// Retrieve the user's current, updated data
  const lostSubpostsAfter = await redis.zRange(`lostSubposts:${redditUser.id}`, 0, -1);
  const wonSubposts = await redis.zRange(`wonSubposts:${redditUser.id}`, 0, -1);
  const completedGames = await redis.zRange(`completedGames:${redditUser.id}`, 0, -1);

  return c.json<UserDefeatResponse>({
    user: {
      id: redditUser.id,
      name: redditUser.username,
      currentXP,
      loseRate,
      winRate: Number(userDetails?.winRate ?? 0),
      recordsWon: Number(userDetails?.recordsWon ?? 0),
      lostSubposts: lostSubpostsAfter.map(i => i.member),
      wonSubposts: wonSubposts.map(i => i.member),
      completedGames: completedGames.map(i => i.member),
    }
  });
});

// VICTORY
api.post('/victory', async (c) => {
  const body = await c.req.json();
  const { userId, gameSeed, isCompletedGame, postData } = body;

  const VICTORY_XP_VALUE = 300;
  const SECOND_VICTORY_XP_VALUE = 15;

  const redditUser = await reddit.getCurrentUser();
  if (!redditUser) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'Not logged in',
      },
      401
    );
  }

  const xpGain = isCompletedGame ? SECOND_VICTORY_XP_VALUE : VICTORY_XP_VALUE;

  const raw = await redis.hGetAll(`userDetails:${userId}`);
  const currentXP = Number(raw.xpValue ?? 0) + xpGain;
  const winRate = Number(raw.winRate ?? 0) + 1;
  const loseRate = Number(raw.loseRate ?? 0);
  const recordsWon = Number(raw.recordsWon ?? 0) + (postData?.subpostID != null ? 1 : 0);

  await redis.hSet(`userDetails:${userId}`, {
    xpValue: currentXP.toString(),
    winRate: winRate.toString(),
    loseRate: loseRate.toString(),
    recordsWon: recordsWon.toString(),
  });

  const existingGames = await redis.zRange(`completedGames:${userId}`, 0, -1);
  const updatedGames = [...existingGames, gameSeed];
  await redis.del(`completedGames:${userId}`);
  const members = updatedGames.map((game, index) => ({ score: index, member: game }));
  await redis.zAdd(`completedGames:${userId}`, ...members);

  if (postData?.subpostID != null) {
    const subpostID = postData.subpostID;
    await redis.hSet(`subpost:${subpostID}`, {
      subpostID,
      totalTime: postData.totalTime.toString(),
      gameSeed: postData.gameSeed,
      userID: postData.userID,
      victoriesNumber: (Number(postData.victoriesNumber ?? 0) + 1).toString(),
      defeatsNumber: postData.defeatsNumber,
      ownerInfoString: postData.ownerInfoString,
    });

    const existingWon = await redis.zRange(`wonSubposts:${userId}`, 0, -1);
    const updatedWon = [...existingWon, subpostID];
    await redis.del(`wonSubposts:${userId}`);
    const wonMembers = updatedWon.map((game, index) => ({ score: index, member: game }));
    await redis.zAdd(`wonSubposts:${userId}`, ...wonMembers);
  }

  /// Retrieve the user's current, updated data
  const wonSubpostsAfter = await redis.zRange(`wonSubposts:${userId}`, 0, -1);
  const lostSubposts = await redis.zRange(`lostSubposts:${userId}`, 0, -1);
  const completedGamesAfter = await redis.zRange(`completedGames:${userId}`, 0, -1);

  return c.json<UserVictoryResponse>({
    user: {
      id: userId,
      name: redditUser?.username ?? '',
      currentXP,
      loseRate,
      winRate,
      recordsWon,
      wonSubposts: wonSubpostsAfter.map(i => i.member),
      lostSubposts: lostSubposts.map(i => i.member),
      completedGames: completedGamesAfter.map(i => i.member),
    }
  });
});

// CREATE POST WITH AWARD
api.post('/create-post', async (c) => {
  const body = await c.req.json();
  const { userId, totalTime, gameSeed, currentXP, winRate, loseRate, recordsWon, ownerInfoString } = body;

  const SHARE_XP_VALUE = 200;

  await redis.hSet(`userDetails:${userId}`, {
    xpValue: (currentXP + SHARE_XP_VALUE).toString(),
    winRate: winRate.toString(),
    loseRate: loseRate.toString(),
    recordsWon: recordsWon.toString(),
  });

  const { subredditName } = context;
  const post = await reddit.submitCustomPost({
    title: 'Can you beat my time?',
    subredditName: subredditName!,
    entry: 'default',
  });

  await redis.hSet(`subpost:${post.id}`, {
    subpostID: post.id,
    totalTime: totalTime.toString(),
    gameSeed,
    userID: userId,
    victoriesNumber: '0',
    defeatsNumber: '0',
    ownerInfoString,
  });

  return c.json({ postId: post.id });
});