import { Devvit, Context, useAsync, useState } from '@devvit/public-api';
import { PageType } from '../enums/PageType.js';
import { CardRank } from '../enums/CardRank.js';
import { CardSuit } from '../enums/CardSuit.js';
import { GamePage } from '../pages/game_page.js';
import { PlayingCard } from '../models/PlayingCard.js';

import seedrandom from 'seedrandom';

interface SubpostPageProps {
    gameSeed: string;
    onStartGame: (seed: string) => void;
}

export function SubpostPage({ gameSeed, onStartGame }: SubpostPageProps) {
    return (
        <vstack height="100%" width="100%" alignment="center middle" gap="medium">
            {/* {usernameLoading ? (
                <text>Loading username...</text>
            ) : usernameError ? (
                <text>Error loading username: {usernameError.message}</text>
            ) : (
                <text>Welcome, {username} LVL 999!</text>
            )} */}
            <button appearance="primary" onPress={() => onStartGame(gameSeed)}>Start a random game</button>
        </vstack>
    );
}