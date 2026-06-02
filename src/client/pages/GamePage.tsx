import { useState } from 'react';

import { PlayingCard } from '../models/PlayingCard.js';
import { UserModel } from '../../shared/models/UserModel.js';

import { CardRank } from '../enums/CardRank.js';
import { GameStatus } from '../enums/GameStatus.js';

import { PlayingCardComponent } from '../components/PlayingCardComponent.js';
import { CellComponent } from '../components/CellComponent.js';
import { TimerComponent } from '../components/TimerComponent.js';
import { RulesDialogComponent } from '../components/RulesDialogComponent.js';
import { StopGameDialogComponent } from '../components/StopGameDialogComponent.js';
import { DefeatDialogComponent } from '../components/DefeatDialogComponent.js';
import { VictoryDialogComponent } from '../components/VictoryDialogComponent.js';

interface GamePageProps {
    gameSeed: string;
    user: UserModel;
    isCompletedGame: boolean;
    postData: Record<string, string> | undefined;
    cards: PlayingCard[][];
    onBackToMenu: () => void;
}

export function GamePage({ gameSeed, user, isCompletedGame, postData, cards, onBackToMenu }: GamePageProps) {
    const [isRulesShow, setIsRulesShow] = useState<boolean>(false);
    const [isStopDialogShow, setStopDialogShow] = useState<boolean>(false);
    const [isEndGame, setIsGameEnd] = useState<GameStatus>(GameStatus.InProgress);
    const [gotTime, setTime] = useState<number | null>(null);
    const [supermoves, setSupermoves] = useState<number>(5);
    const [columns, setColumns] = useState<PlayingCard[][]>(cards);
    const [freeCells, setFreeCells] = useState<(PlayingCard | null)[]>(Array(4).fill(null));
    const [foundationCells, setFoundationCells] = useState<(PlayingCard | null)[]>(Array(4).fill(null));
    const [selectedCards, setSelectedCards] = useState<PlayingCard[]>([]);

    function getMaxMovableCards(freeCellList: (PlayingCard | null)[], columnList: PlayingCard[][]): number {
        const freeCellsNumber = freeCellList.filter(cell => cell == null).length;
        const emptyCascades = columnList.filter(column => column.length == 0).length;
        endGameCheck(freeCellList, foundationCells, columnList, freeCellsNumber, emptyCascades);
        return Math.pow(2, emptyCascades) * (freeCellsNumber + 1);
    }

    function unselectColumnByIndex(index: number): PlayingCard[][] {
        const updatedColumns = [...columns];
        let updatedColumn = updatedColumns[index];

        if (updatedColumn) {
            for (const card of updatedColumn) {
                card.isSelected = false;
                card.columnPosition = -1;
            }
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
        if (cardIndex != -1) updatedCells[cardIndex] = null;
        return updatedCells;
    }

    const unselectSelectedCards = () => {
        if (selectedCards.length > 0) {
            const columnIndex = selectedCards[0]?.columnPosition ?? -1;
            if (columnIndex >= 0) {
                setColumns(unselectColumnByIndex(columnIndex));
            } else {
                setFreeCells(unselectFreeCells());
            }
            setSelectedCards([]);
        }
    };

    function cutColumnByIndex(index: number, size: number): PlayingCard[][] {
        const updatedColumns = [...columns];
        let updatedColumn = updatedColumns[index];

        if (updatedColumn) {
            updatedColumns[index] = updatedColumn.slice(0, -size);
        }

        return updatedColumns;
    }

    function addToSelectedCard(card: PlayingCard): PlayingCard[] {
        return [...selectedCards, card];
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
    };

    const handleColumnClick = (index: number) => {
        const updatedColumns = [...columns];
        let updatedColumn = updatedColumns[index];

        if (selectedCards.length === 0 && updatedColumn && updatedColumn.length == 0) return;

        if (selectedCards.length == 0) {
            let columnItem = updatedColumns[index];
            if (columnItem) {
                const currentCard = columnItem[columnItem.length - 1];

                if (currentCard) {
                    currentCard.columnPosition = index;
                    currentCard.isSelected = !currentCard.isSelected;
                    setSelectedCards([currentCard]);
                    setColumns(updatedColumns);
                }
            }
        } else {
            const selectedCard = selectedCards[0];
            if (selectedCard && index == selectedCard.columnPosition) {
                if (selectedCards.length < supermoves) {
                    let columnItem = updatedColumns[index];
                    if (columnItem) {
                        const nextCardIndex = columnItem.length - selectedCards.length - 1;
                        if (nextCardIndex >= 0) {
                            const nextCard = columnItem[nextCardIndex];
                            const lastSelectedCard = selectedCards[selectedCards.length - 1];
                            if (nextCard && lastSelectedCard && nextCard.isRed != lastSelectedCard.isRed && Number(nextCard.rank) == Number(lastSelectedCard.rank) + 1) {
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
                    }
                } else {
                    setColumns(unselectColumnByIndex(index));
                    setSelectedCards([]);
                }
            } else {
                const lastSelectedCard = selectedCards[selectedCards.length - 1];
                let columnItem = updatedColumns[index];
                if (lastSelectedCard && columnItem &&
                    (columnItem.length > 0
                        && columnItem[columnItem.length - 1]?.isRed != lastSelectedCard.isRed
                        && Number(columnItem[columnItem.length - 1]?.rank) == Number(lastSelectedCard.rank) + 1)
                    || columnItem?.length == 0
                ) {
                    if (columnItem && selectedCard && selectedCard.isInFreeCell) {
                        selectedCard.isSelected = false;
                        selectedCard.isInFreeCell = false;
                        updatedColumns[index] = [...columnItem, selectedCard];
                        const updatedFreeCells = removeCardFromFreeCells(selectedCard);
                        setFreeCells(updatedFreeCells);
                        setColumns(updatedColumns);
                        setSelectedCards([]);
                        setSupermoves(getMaxMovableCards(updatedFreeCells, updatedColumns));
                    } else {
                        if (selectedCard) {
                            let selectedCardColumnItem = updatedColumns[selectedCard.columnPosition];

                            if (columnItem && selectedCardColumnItem) {
                                for (const card of selectedCardColumnItem) card.isSelected = false;
                                const movedCards = selectedCardColumnItem.slice(-selectedCards.length);
                                updatedColumns[selectedCard.columnPosition] = selectedCardColumnItem.slice(0, -selectedCards.length);
                                updatedColumns[index] = [...columnItem, ...movedCards];
                                setColumns(updatedColumns);
                                setSelectedCards([]);
                                setSupermoves(getMaxMovableCards(freeCells, updatedColumns));
                            }
                        }
                    }
                } else {
                    unselectSelectedCards();
                }
            }
        }
    };

    const handleFreeCellClick = (index: number) => {
        if (selectedCards.length == 1) {
            const selectedCard = selectedCards[0];
            if (selectedCard && selectedCard.rank != CardRank.Ace) {
                if (freeCells[index] == null) {
                    selectedCard.isSelected = false;
                    if (selectedCard.isInFreeCell) {
                        setFreeCells(moveCardInFreeCellsByIndex(index, selectedCard));
                        setSelectedCards([]);
                    } else {
                        const updatedFreeCells = replaceFreeCellByIndex(index, selectedCard);
                        const updatedColumns = cutColumnByIndex(selectedCard.columnPosition, 1);
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
        } else if (freeCells[index] != null) {
            const freeCellCard = freeCells[index]!;
            freeCellCard.isInFreeCell = true;
            freeCellCard.isSelected = true;
            freeCellCard.columnPosition = -1;
            setFreeCells([...freeCells]);
            setSelectedCards(addToSelectedCard(freeCellCard));
        }
    };

    const handleFoundationCellClick = (index: number) => {
        if (selectedCards.length == 1) {
            const selectedCard = selectedCards[0];
            if (selectedCard && foundationCells[index] == null) {
                if (selectedCard.rank == CardRank.Ace) {
                    selectedCard.isSelected = false;
                    const updatedColumns = cutColumnByIndex(selectedCard.columnPosition, 1);
                    setFoundationCells(replaceFoundationCellByIndex(index, selectedCard));
                    setColumns(updatedColumns);
                    setSelectedCards([]);
                    setSupermoves(getMaxMovableCards(freeCells, updatedColumns));
                } else {
                    unselectSelectedCards();
                }
            } else if (selectedCard && selectedCard.suit == foundationCells[index]!.suit) {
                if (
                    (foundationCells[index]!.rank == CardRank.Ace && selectedCard.rank == CardRank.Two)
                    || Number(foundationCells[index]!.rank) + 1 == Number(selectedCard.rank)
                ) {
                    selectedCard.isSelected = false;
                    if (selectedCard.isInFreeCell) {
                        selectedCard.isInFreeCell = false;
                        const updatedFreeCells = removeCardFromFreeCells(selectedCard);
                        setFoundationCells(replaceFoundationCellByIndex(index, selectedCard));
                        setFreeCells(updatedFreeCells);
                        setSelectedCards([]);
                        setSupermoves(getMaxMovableCards(updatedFreeCells, columns));
                    } else {
                        const updatedColumns = cutColumnByIndex(selectedCard.columnPosition, 1);
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

    function checkingPossibleMoveInFoundation(card: PlayingCard, foundationCellsList: (PlayingCard | null)[]): boolean {
        for (const foundationCellsCard of foundationCellsList) {
            if (
                foundationCellsCard != null &&
                foundationCellsCard.suit === card.suit &&
                ((foundationCellsCard.rank === CardRank.Ace && card.rank === CardRank.Two)
                    || Number(foundationCellsCard.rank) + 1 === Number(card.rank))
            ) {
                return true;
            }
        }
        return false;
    }

    function endGameCheck(
        freeCellList: (PlayingCard | null)[],
        foundationCellsList: (PlayingCard | null)[],
        columnList: PlayingCard[][],
        freeCellsNumber: number,
        emptyCascades: number
    ) {
        // Checking the victory
        let isOrganized = true;
        for (const deck of columnList) {
            if (deck.length == 0) continue;
            for (let i = 0; i < deck.length - 1; i++) {
                let currentCard = deck[i];
                let previousCard = deck[i + 1];

                if (currentCard && previousCard && Number(currentCard.rank) < Number(previousCard.rank)) {
                    isOrganized = false;
                    break;
                }
            }
            if (!isOrganized) break;
        }

        if (isOrganized) {
            setIsGameEnd(GameStatus.Victory);
            return;
        }

        // Checking for defeat
        if (freeCellsNumber == 0 && emptyCascades == 0) {
            for (const freeCellCard of freeCellList) {
                if (freeCellCard != null) {
                    if (checkingPossibleMoveInFoundation(freeCellCard, foundationCellsList)) return;
                    for (const columnCard of columnList) {
                        const lastColumnCard = columnCard[columnCard.length - 1];
                        if (lastColumnCard && Number(freeCellCard.rank) + 1 === Number(lastColumnCard.rank) && freeCellCard.isRed != lastColumnCard.isRed) return;
                    }
                }
            }
            for (const columnCard of columnList) {
                const lastColumnCard = columnCard[columnCard.length - 1];
                if ((lastColumnCard && lastColumnCard.rank === CardRank.Ace) || (lastColumnCard && checkingPossibleMoveInFoundation(lastColumnCard, foundationCellsList))) return;
                for (const card of columnList) {
                    const lastCard = card[card.length - 1];
                    if (lastCard && lastColumnCard && lastCard === lastColumnCard) continue;
                    if (lastCard && lastColumnCard && Number(lastCard.rank) === Number(lastColumnCard.rank) + 1 && lastCard.isRed != lastColumnCard.isRed) return;
                }
            }
            setIsGameEnd(GameStatus.Defeat);
        }
    }

    return (
        <div className="game-screen-wrapper">
            <div className="game-inner-container">

                {/* Top Bar */}
                <header className="game-top-bar">
                    {/* Back Button */}
                    <img src="/buttons/b_back.png" alt="Back Button" className="clickable-button btn-back-top-left" onClick={() => setStopDialogShow(true)} />

                    {/* Game Info Background */}
                    <div className="game-info-plate">
                        <img src="/interface_background/game_info_background.png" alt="Game info background" className="info-plate-bg" />
                        <div className="info-plate-content">
                            <span className="text-small bold-text">Supermoves: {supermoves}</span>
                            <span className="text-small bold-text"> Game: {postData?.gameSeed == null ? gameSeed : '******'} </span>

                            {/* Timer */}
                            <TimerComponent
                                getTotalTime={(totalTime: number) => setTime(totalTime)}
                                isKeepGoing={isEndGame == GameStatus.InProgress}
                                totalTime={postData?.totalTime != null ? Number(postData.totalTime) : null}
                                stopGame={() => setIsGameEnd(GameStatus.Defeat)}
                            />
                        </div>
                    </div>

                    {/* Rules Button */}
                    <img src="/buttons/b_question.png" alt="Rules Button" className="clickable-button btn-back-top-right" onClick={() => setIsRulesShow(true)} />
                </header>

                {/* Free and foundation cells (Top row) */}
                <div className="slots-background-wrapper">
                    <section className="slots-grid-row">
                        {[...freeCells, ...foundationCells].map((cell, index) => {
                            const isFreeCell = index < freeCells.length;
                            return (
                                <div key={index} className="slot-cell-trigger" onClick={() => isFreeCell ? handleFreeCellClick(index) : handleFoundationCellClick(index - freeCells.length)} >
                                    <CellComponent card={cell} isFreeCell={isFreeCell} />
                                </div>
                            );
                        })}
                    </section>
                </div>

                {/* Game columns with cards (bottom part of the field) */}
                <main className="columns-grid-area">
                    {columns.map((column, index) => (
                        <div key={index} className="game-card-column" onClick={() => handleColumnClick(index)} >
                            {column.map((card, cardIndex) => (<PlayingCardComponent key={cardIndex} card={card} cardIndex={cardIndex} />))}
                        </div>
                    ))}
                </main>
            </div>

            {/* Rules Dialog */}
            {isRulesShow && <RulesDialogComponent onDialogClose={() => setIsRulesShow(false)} />}

            {/*Stop Game Dialog */}
            {isStopDialogShow && (<StopGameDialogComponent onBackToMenu={onBackToMenu} onDialogClose={() => setStopDialogShow(false)} />)}

            {/*Victory Dialog */}
            {isEndGame == GameStatus.Victory && gotTime != null && (<VictoryDialogComponent onDialogClose={onBackToMenu} totalTime={gotTime} gameSeed={gameSeed} isCompletedGame={isCompletedGame} user={user} postData={postData} />)}

            {/*Defeat Dialog */}
            {isEndGame == GameStatus.Defeat && gotTime != null && (<DefeatDialogComponent onDialogClose={onBackToMenu} totalTime={gotTime} user={user} postData={postData} />)}
        </div >
    );
}