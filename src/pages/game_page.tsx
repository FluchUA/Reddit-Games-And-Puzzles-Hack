import { Devvit, useState, RedditAPIClient, RedisClient } from '@devvit/public-api';

import { PlayingCard } from '../models/PlayingCard.js';
import { UserModel } from '../models/UserModel.js';

import { CardRank } from '../enums/CardRank.js';
import { GameStatus } from '../enums/GameStatus.js';

import { PlayingCardComponent } from '../components/PlayingCardComponent.js';
import { CallComponent } from '../components/CellComponent.js';
import { TimerComponent } from '../components/TimerComponent.js';
import { RulesDialogComponent } from '../components/RulesDialogComponent.js';
import { StopGameDialogComponent } from '../components/StopGameDialogComponent.js';
import { DefeatDialogComponent } from '../components/DefeatDialogComponent.js';
import { VictoryDialogComponent } from '../components/VictoryDialogComponent.js';

const BUTTON_SIZE = "40px";

interface GamePageProps {
    gameSeed: string;
    user: UserModel;
    isCompletedGame: boolean;
    cards: PlayingCard[][];
    onBackToMenu: () => void;
    redditClient: RedditAPIClient;
    redisClient: RedisClient;
}

export function GamePage({ gameSeed, user, isCompletedGame, cards, onBackToMenu, redditClient, redisClient }: GamePageProps) {
    const [isRulesShow, setIsRulesShow] = useState<boolean>(false);
    const [isStopDialogShow, setStopDialogShow] = useState<boolean>(false);
    const [isEndGame, setIsGameEnd] = useState<GameStatus>(GameStatus.InProgress);
    const [gotTime, setTime] = useState<number | null>(null);
    const [supermoves, setSupermoves] = useState<number>(5);
    const [columns, setColumns] = useState<PlayingCard[][]>(cards);
    const [freeCells, setFreeCells] = useState<(PlayingCard | null)[]>(Array(4).fill(null)); // 4 Empty cells
    const [foundationCells, setFoundationCells] = useState<(PlayingCard | null)[]>(Array(4).fill(null)); // 4 Foundation cells
    const [selectedCards, setSelectedCards] = useState<PlayingCard[]>([]);

    function getMaxMovableCards(freeCellList: (PlayingCard | null)[], columnList: PlayingCard[][]): number {
        let freeCellsNumber = freeCellList.filter(cell => cell == null).length;
        let emptyCascades = columnList.filter(column => column.length == 0).length;

        endGameCheck(freeCellList, foundationCells, columnList, freeCellsNumber, emptyCascades);

        return Math.pow(2, emptyCascades) * (freeCellsNumber + 1);
    }

    function unselectColumnByIndex(index: number): PlayingCard[][] {
        const updatedColumns = [...columns];
        for (const card of updatedColumns[index]) {
            card.isSelected = false;
            card.columnPosition = -1;
        }

        return updatedColumns;
    }

    function unselectFreeCells(): (PlayingCard | null)[] {
        const updatedCells = [...freeCells];
        for (const card of updatedCells) {
            if (card != null) {
                card.isSelected = false;
                card.columnPosition = -1;
            }
        }

        return updatedCells;
    }

    function moveCardInFreeCellsByIndex(index: number, selectedCard: PlayingCard): (PlayingCard | null)[] {
        const updatedCells = [...freeCells];
        const cardIndex = updatedCells.findIndex(card => card?.rank == selectedCard.rank && card?.suit == selectedCard.suit);
        if (cardIndex != -1) {
            updatedCells.splice(cardIndex, 1);
            updatedCells.splice(index, 0, selectedCard);
        }

        return updatedCells;
    }

    function removeCardFromFreeCells(selectedCard: PlayingCard): (PlayingCard | null)[] {
        const updatedCells = [...freeCells];
        const cardIndex = updatedCells.findIndex(card => card?.rank == selectedCard.rank && card?.suit == selectedCard.suit);
        if (cardIndex != -1) {
            updatedCells[cardIndex] = null;
        }

        return updatedCells;
    }

    const unselectSelectedCards = () => {
        if (selectedCards.length > 0) {
            let columnIndex = selectedCards[0].columnPosition;
            if (columnIndex >= 0) {
                setColumns(unselectColumnByIndex(columnIndex));
                setSelectedCards([]);
            } else {
                setFreeCells(unselectFreeCells());
                setSelectedCards([]);
            }
        }
    }

    function cutColumnByIndex(index: number, size: number): PlayingCard[][] {
        const updatedColumns = [...columns];
        updatedColumns[index] = updatedColumns[index].slice(0, -size);

        return updatedColumns;
    }

    function addToSelectedCard(card: PlayingCard): PlayingCard[] {
        let newList = [...selectedCards];
        newList = [...newList, card];

        return newList;
    }

    function replaceFreeCellByIndex(index: number, selectedCard: PlayingCard): (PlayingCard | null)[] {
        const updatedList = [...freeCells];
        updatedList.splice(index, 1, selectedCard);

        return updatedList;
    }

    const replaceFoundationCellByIndex = (index: number, selectedCard: PlayingCard) => {
        const updatedList = [...foundationCells];
        updatedList.splice(index, 1, selectedCard);

        return updatedList;
    }

    // Handling clicks on card columns
    const handleColumnClick = (index: number) => {
        const updatedColumns = [...columns];

        if (selectedCards.length == 0 && updatedColumns[index].length == 0) {
            return;
        }

        // If there are no selected cards - select the current one
        if (selectedCards.length == 0) {
            const currentCard = updatedColumns[index][updatedColumns[index].length - 1];
            currentCard.columnPosition = index;
            currentCard.isSelected = !currentCard.isSelected;
            setSelectedCards([currentCard]);
            setColumns(updatedColumns);
        } else {
            const selectedCard = selectedCards[0];

            //  When clicking again on the column with the selected card
            if (index == selectedCard.columnPosition) {
                // If the number of selected cards is less than or equal to the number of super moves
                if (selectedCards.length < supermoves) {
                    let nextCardIndex = updatedColumns[index].length - selectedCards.length - 1;

                    if (nextCardIndex >= 0) {
                        let nextCard = updatedColumns[index][nextCardIndex];
                        let lastSelectedCard = selectedCards[selectedCards.length - 1];

                        // Select the next card if it has a different color and its rank is 1 more than the currently selected one.
                        if (nextCard.isRed != lastSelectedCard.isRed
                            && Number(nextCard.rank) == Number(lastSelectedCard.rank) + 1) {

                            nextCard.isSelected = true;
                            setSelectedCards(addToSelectedCard(nextCard));
                            setColumns(updatedColumns);
                        } else {
                            setColumns(unselectColumnByIndex(index));
                            setSelectedCards([]);
                        }
                    } else {
                        setColumns(unselectColumnByIndex(index));
                        setSelectedCards([]);
                    }
                } else {
                    setColumns(unselectColumnByIndex(index));
                    setSelectedCards([]);
                }

                // If another column was clicked
            } else {
                let lastSelectedCard = selectedCards[selectedCards.length - 1];

                // When clicking on another column, move the selected cards if the first of them 
                // has a different color and its rank is 1 more than the currently selected one.
                if ((updatedColumns[index].length > 0
                    && updatedColumns[index][updatedColumns[index].length - 1].isRed != lastSelectedCard.isRed
                    && Number(updatedColumns[index][updatedColumns[index].length - 1].rank) == Number(lastSelectedCard.rank) + 1)
                    || updatedColumns[index].length == 0) {

                    // If the selected card from a free cell
                    if (selectedCard.isInFreeCell) {
                        selectedCard.isSelected = false;
                        selectedCard.isInFreeCell = false;
                        updatedColumns[index] = [...updatedColumns[index], selectedCard];
                        let updatedFreeCells = removeCardFromFreeCells(selectedCard);

                        setFreeCells(updatedFreeCells);
                        setColumns(updatedColumns);
                        setSelectedCards([]);
                        setSupermoves(getMaxMovableCards(updatedFreeCells, updatedColumns));

                        // If the selected cards are from another column
                    } else {
                        for (const card of updatedColumns[selectedCard.columnPosition]) {
                            card.isSelected = false;
                        }

                        let movedCards = updatedColumns[selectedCard.columnPosition].slice(-selectedCards.length);
                        for (const card of movedCards) {
                            card.dustAnimationState = 3;
                        }
                        updatedColumns[selectedCard.columnPosition] = updatedColumns[selectedCard.columnPosition].slice(0, -selectedCards.length);
                        updatedColumns[index] = [...updatedColumns[index], ...movedCards];

                        setColumns(updatedColumns);
                        setSelectedCards([]);
                        setSupermoves(getMaxMovableCards(freeCells, updatedColumns));
                    }
                } else {
                    unselectSelectedCards();
                }
            }
        }
    };

    // Handling clicking on empty cells
    const handleFreeCellClick = (index: number) => {
        if (selectedCards.length == 1) {
            const selectedCard = selectedCards[0];

            // If the chosen card is not an ace
            if (selectedCard.rank != CardRank.Ace) {
                // If the cell is empty
                if (freeCells[index] == null) {
                    selectedCard.isSelected = false;

                    // If the card was selected from a free cell
                    if (selectedCard.isInFreeCell) {
                        setFreeCells(moveCardInFreeCellsByIndex(index, selectedCard));
                        setSelectedCards([]);
                    } else {
                        let updatedFreeCells = replaceFreeCellByIndex(index, selectedCard);
                        let updatedColumns = cutColumnByIndex(selectedCard.columnPosition, 1);

                        setFreeCells(updatedFreeCells);
                        setColumns(updatedColumns);
                        setSelectedCards([]);
                        setSupermoves(getMaxMovableCards(updatedFreeCells, updatedColumns));
                    }
                } else {
                    unselectSelectedCards();
                }
            } else {
                unselectSelectedCards();
            }
        } else if (selectedCards.length > 1) {
            unselectSelectedCards();
            // Select a card blank from a free cell
        } else if (freeCells[index] != null) {
            let freeCellCard = freeCells[index];
            freeCellCard.isInFreeCell = true;
            freeCellCard.isSelected = true;
            freeCellCard.columnPosition = -1;
            setFreeCells([...freeCells]);
            setSelectedCards(addToSelectedCard(freeCellCard));
        }
    };

    // Handling clicking on foundation cells
    const handleFoundationCellClick = (index: number) => {
        if (selectedCards.length == 1) {
            const selectedCard = selectedCards[0];

            // If the cell is empty
            if (foundationCells[index] == null) {
                // If the chosen card is an ace
                if (selectedCard.rank == CardRank.Ace) {
                    selectedCard.isSelected = false;

                    let updatedColumns = cutColumnByIndex(selectedCard.columnPosition, 1);
                    setFoundationCells(replaceFoundationCellByIndex(index, selectedCard));
                    setColumns(updatedColumns);
                    setSelectedCards([]);
                    setSupermoves(getMaxMovableCards(freeCells, updatedColumns));
                } else {
                    unselectSelectedCards();
                }

                // If the selected cell is not empty, the selected card has the same suit 
                // and its rank is 1 higher than the card in the selected cell
            } else if (selectedCard.suit == foundationCells[index].suit) {
                if (foundationCells[index].rank == CardRank.Ace && selectedCard.rank == CardRank.Two
                    || Number(foundationCells[index].rank) + 1 == Number(selectedCard.rank)
                ) {
                    selectedCard.isSelected = false;

                    // If the selected card from a free cell
                    if (selectedCard.isInFreeCell) {
                        selectedCard.isInFreeCell = false;

                        let updatedFreeCells = removeCardFromFreeCells(selectedCard);
                        setFoundationCells(replaceFoundationCellByIndex(index, selectedCard));
                        setFreeCells(updatedFreeCells);
                        setSelectedCards([]);
                        setSupermoves(getMaxMovableCards(updatedFreeCells, columns));
                    } else {
                        let updatedColumns = cutColumnByIndex(selectedCard.columnPosition, 1);
                        setFoundationCells(replaceFoundationCellByIndex(index, selectedCard));
                        setColumns(updatedColumns);
                        setSelectedCards([]);
                        setSupermoves(getMaxMovableCards(freeCells, updatedColumns));
                    }
                } else {
                    unselectSelectedCards();
                }
            } else {
                unselectSelectedCards();
            }
        } else if (selectedCards.length > 1) {
            unselectSelectedCards();
        }
    };

    function endGameCheck(freeCellList: (PlayingCard | null)[], foundationCellsList: (PlayingCard | null)[], columnList: PlayingCard[][], freeCellsNumber: number, emptyCascades: number) {
        /// Сheck victory
        let isOrganized = true;
        for (const deck of columnList) {
            if (deck.length == 0) {
                continue;
            }

            // Checking to make sure all the stacks are organized
            for (let i = 0; i < deck.length - 1; i++) {
                if (Number(deck[i].rank) < Number(deck[i + 1].rank)) {
                    isOrganized = false;
                    break;
                }
            }

            if (!isOrganized) {
                break;
            }
        }

        if (isOrganized) {
            setIsGameEnd(GameStatus.Victory);
            return;
        }

        /// Check defeat
        /// If there are no free places
        if (freeCellsNumber == 0 && emptyCascades == 0) {
            for (const freeCellCard of freeCellList) {
                if (freeCellCard != null) {
                    /// Checking for an ace
                    /// Check if something can be put in the foundation
                    if (freeCellCard.rank == CardRank.Ace || checkingPossibleMoveInFoundation(freeCellCard, foundationCellsList)) {
                        return;
                    }

                    /// Check if a free cell can be released
                    for (const columnCard of columnList) {
                        let lastColumnCard = columnCard[columnCard.length - 1];
                        if (Number(freeCellCard.rank) + 1 == Number(lastColumnCard.rank) &&
                            freeCellCard.isRed != lastColumnCard.isRed) {
                            return;
                        }
                    }
                }
            }
            for (const columnCard of columnList) {
                let lastColumnCard = columnCard[columnCard.length - 1];
                /// Checking for an ace
                /// Check if something can be put in the foundation
                if (lastColumnCard.rank == CardRank.Ace || checkingPossibleMoveInFoundation(lastColumnCard, foundationCellsList)) {
                    return;
                }

                /// Check if it is possible to move cards from column to column
                for (const card of columnList) {
                    let lastCard = card[card.length - 1];
                    if (Number(lastCard.rank) == Number(lastColumnCard.rank) + 1 &&
                        lastCard.isRed != lastColumnCard.isRed) {
                        return;
                    }
                }
            }

            setIsGameEnd(GameStatus.Defeat);
        }
    }

    function checkingPossibleMoveInFoundation(card: PlayingCard, foundationCellsList: (PlayingCard | null)[]): boolean {
        for (const foundationCellsCard of foundationCellsList) {
            if (foundationCellsCard != null && foundationCellsCard?.suit == card?.suit &&
                ((foundationCellsCard?.rank == CardRank.Ace && card?.rank == CardRank.Two)
                    || (Number(foundationCellsCard?.rank) + 1 == Number(card?.rank)))) {
                return true;
            }
        }

        return false;
    }

    return (
        <zstack width="100%" height="100%" alignment="center middle">
            <vstack height="95%" width="95%" alignment="center top" gap='small'>
                <zstack width="100%" height="50px" alignment="center middle">
                    <hstack width="100%" alignment="start middle" gap="medium">
                        <button width={BUTTON_SIZE} height={BUTTON_SIZE} onPress={() => setStopDialogShow(true)}>🠜</button>
                    </hstack>
                    <hstack width="100%" alignment="end middle" gap="medium">
                        <button width="20px" height="20px" onPress={() => setIsGameEnd(GameStatus.Victory)}>TestV</button>
                        <button width="20px" height="20px" onPress={() => setIsGameEnd(GameStatus.Defeat)}>TestD</button>

                        <button width={BUTTON_SIZE} height={BUTTON_SIZE} onPress={() => setIsRulesShow(true)}>?</button>
                    </hstack>

                    <vstack width="100px" alignment="center middle" gap="none">
                        <text size="medium" weight="bold">Supermoves: {supermoves}</text>
                        <text size="medium" weight="bold">Game: {gameSeed}</text>
                        <TimerComponent size="medium" getTotalTime={(totalTime: number) => setTime(totalTime)} isKeepGoing={isEndGame == GameStatus.InProgress} />
                    </vstack>
                </zstack>

                {/* Empty and Foundation cells */}
                <hstack width="100%" height="80px" alignment="center middle" gap="none">
                    {[...freeCells, ...foundationCells].map((cell, index) => {
                        const isFreeCell = index < freeCells.length; // First 4 are free cells

                        return (
                            <zstack
                                width={`${100 / (freeCells.length + foundationCells.length)}%`}
                                height="100%" alignment="center middle"
                                onPress={() => (isFreeCell ? handleFreeCellClick(index) : handleFoundationCellClick(index - freeCells.length))}>
                                <CallComponent card={cell} isFreeCell={isFreeCell} />
                            </zstack>
                        );
                    })}
                </hstack>

                {/* Card columns */}
                <hstack height="100%" width="100%" alignment="center middle">
                    {columns.map((column, index) => (
                        <zstack width={`${100 / columns.length}%`} height="100%" alignment="center middle" onPress={() => handleColumnClick(index)}>
                            {column.map((card, cardIndex) => (<PlayingCardComponent card={card} cardIndex={cardIndex} />))}
                        </zstack>
                    ))}
                </hstack>
            </vstack>


            {isRulesShow && (
                <RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />
            )}

            {isStopDialogShow && (
                <StopGameDialogComponent onBackToMenu={onBackToMenu} onDialogClose={() => setStopDialogShow(false)} />
            )}

            {isEndGame == GameStatus.Victory && gotTime && (
                <VictoryDialogComponent
                    onDialogClose={onBackToMenu}
                    totalTime={gotTime}
                    gameSeed={gameSeed}
                    isCompletedGame={isCompletedGame}
                    user={user}
                    redditClient={redditClient}
                    redisClient={redisClient}
                />
            )}

            {isEndGame == GameStatus.Defeat && gotTime && (
                <DefeatDialogComponent
                    onDialogClose={onBackToMenu}
                    totalTime={gotTime}
                    user={user}
                    redditClient={redditClient}
                    redisClient={redisClient}
                />
            )}
        </zstack>
    )
}
