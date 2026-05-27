import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  UserRepsonse,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const api = new Hono();

/// GET USER
api.get('/get-user', async (c) => {
  const { userId, postId } = context;

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

