import { Devvit, useState } from '@devvit/public-api';

import { PlayingCard } from '../models/PlayingCard.js';
import { CardRank } from '../enums/CardRank.js';
import { CardSuit } from '../enums/CardSuit.js';

import seedrandom from 'seedrandom';

const BUTTON_SIZE = "40px";

interface CreateGamePageProps {
    onBackToMenu: () => void;
    onStartGame: (columns: PlayingCard[][]) => void;
}

export function CreateGamePage({ onBackToMenu, onStartGame }: CreateGamePageProps) {
    const [seed, setSeed] = useState<string>("------");

    const onNumberPressed = (value: number) => {
        const firstDashIndex = seed.indexOf('-');
        if (firstDashIndex !== -1) {
            const newSeed = seed.slice(0, firstDashIndex) + value + seed.slice(firstDashIndex + 1);
            setSeed(newSeed);
        }
    };

    const onCancelPressed = () => {
        // If the row already consists of only dashes, do nothing
        if (!seed.match(/[^-]/)) {
            return;
        }

        const lastFilledIndex = seed.lastIndexOf(seed.match(/[^-]/g)?.pop() ?? '');

        // Replace the symbol with a dash
        if (lastFilledIndex !== -1) {
            const newSeed = seed.slice(0, lastFilledIndex) + '-' + seed.slice(lastFilledIndex + 1);
            setSeed(newSeed);
        }
    };

    const onResetPressed = () => {
        setSeed("------");
    };

    const onPlayPressed = () => {
        let currentSeed = seed;
        if (!seed.match(/[^-]/)) {
            const randomNumber = Math.floor(Math.random() * 1000000);
            const generatedSeed = randomNumber.toString().padEnd(6, '-');
            currentSeed = generatedSeed;
        }
        console.log(`Game Seed ${currentSeed}`);
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

        onStartGame(newCardColumns)
    }

    return (
        <zstack height="95%" width="95%" alignment="center top" gap="medium">
            <hstack width="100%" alignment="start top" gap="medium">
                <button width={BUTTON_SIZE} height={BUTTON_SIZE} onPress={onBackToMenu}>🠜</button>
            </hstack>

            <vstack height="100%" width="100%" alignment="center middle" gap="medium">
                <text size="xlarge" weight="bold">Use a seed or generate a random game</text>
                <text size="xxlarge" weight="bold">{seed}</text>

                <hstack alignment="center middle" gap="small">
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(1)}>1</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(2)}>2</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(3)}>3</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(4)}>4</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(5)}>5</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(6)}>6</button>
                </hstack>

                <hstack alignment="center middle" gap="small">
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onCancelPressed()}>←</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(7)}>7</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(8)}>8</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(9)}>9</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onNumberPressed(0)}>0</button>
                    <button width={BUTTON_SIZE} height={BUTTON_SIZE} appearance="primary" onPress={() => onResetPressed()}>X</button>
                </hstack>

                <button appearance="primary" onPress={onPlayPressed}>Start Game</button>
            </vstack>
        </zstack>
    );
}