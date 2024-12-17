import { CardRank } from '../enums/CardRank.js';
import { CardSuit } from '../enums/CardSuit.js';

export type PlayingCard = {
    suit: CardSuit;
    rank: CardRank;
    isRed: boolean;
    isSelected: boolean;
    isInFreeCell: boolean;
    columnPosition: number;
    assetPath: string;
    cardLvlPath: string;
};