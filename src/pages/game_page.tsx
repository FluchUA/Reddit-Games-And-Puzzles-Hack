import { Devvit, useState, useInterval } from '@devvit/public-api';

import { PlayingCard } from '../models/PlayingCard.js';
import { CardRank } from '../enums/CardRank.js';
import { PlayingCardComponent } from '../components/PlayingCardComponent.js';
import { CallComponent } from '../components/CellComponent.js';

interface GamePageProps {
    cards: PlayingCard[][];
    onBackToMenu: () => void;
}

export function GamePage({ cards, onBackToMenu }: GamePageProps) {
    const [supermoves, setSupermoves] = useState<number>(5);
    const [columns, setColumns] = useState<PlayingCard[][]>(cards);
    const [freeCells, setFreeCells] = useState<(PlayingCard | null)[]>(Array(4).fill(null)); // 4 Empty cells
    const [foundationCells, setFoundationCells] = useState<(PlayingCard | null)[]>(Array(4).fill(null)); // 4 Foundation cells
    const [selectedCards, setSelectedCards] = useState<PlayingCard[]>([]);

    function getMaxMovableCards(freeCellList: (PlayingCard | null)[], columnList: PlayingCard[][]): number {
        let freeCellsNumber = freeCellList.filter(cell => cell == null).length;
        let emptyCascades = columnList.filter(column => column.length == 0).length;

        // TODO: check win/lose

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
                if ((updatedColumns[index].length > 1
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
                        for (const card of updatedColumns[index]) {
                            card.isSelected = false;
                        }
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

    return (
        <vstack height="95%" width="95%" alignment="center top" gap='small'>
            <hstack width="100%" alignment="center middle" gap="medium">
                <button appearance="secondary" onPress={onBackToMenu}> Back to Menu </button>
                <text size="xlarge" weight="bold">Supermoves: {supermoves}</text>
            </hstack>

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
    )
}
