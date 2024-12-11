import { Devvit, useState } from '@devvit/public-api';

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

    function calculateMaxMovableCards() {
        let freeCellsNumber = freeCells.filter(cell => cell == null).length;
        let emptyCascades = columns.filter(column => column.length == 0).length;
        setSupermoves(Math.pow(2, emptyCascades) * (freeCellsNumber + 1));
    }

    const unselectColumnByIndex = (index: number) => {
        for (const card of columns[index]) {
            card.isSelected = false;
            card.columnPosition = -1;
        }
        setColumns(columns);
    }

    const unselectFreeCells = () => {
        for (const card of freeCells) {
            if (card != null) {
                card.isSelected = false;
                card.columnPosition = -1;
            }
        }
        setFreeCells(freeCells);
    }

    const moveCardInFreeCellsByIndex = (index: number) => {
        selectedCards[0].isSelected = false;
        setFreeCells((prev) => {
            const updatedList = [...prev];
            const cardIndex = updatedList.findIndex(card => card?.rank == selectedCards[0].rank && card?.suit == selectedCards[0].suit);
            if (cardIndex != -1) {
                updatedList.splice(cardIndex, 1);
                updatedList.splice(index, 0, selectedCards[0]);
            }

            return updatedList;
        });
    }

    const removeCardFromFreeCells = (selectedCard: PlayingCard) => {
        selectedCard.isInFreeCell = false;
        selectedCard.isSelected = false;
        setFreeCells((prev) => {
            const updatedList = [...prev];
            const cardIndex = updatedList.findIndex(card => card?.rank == selectedCard.rank && card?.suit == selectedCard.suit);
            if (cardIndex != -1) {
                updatedList[cardIndex] = null;
            }

            return updatedList;
        });
    }

    const unselectSelectedCards = () => {
        if (selectedCards.length > 0) {
            let columnIndex = selectedCards[0].columnPosition;
            if (columnIndex >= 0) {
                unselectColumnByIndex(columnIndex);
                setSelectedCards([]);
            } else {
                unselectFreeCells();
                setSelectedCards([]);
            }
        }
    }

    const addToSelectedCard = (card: PlayingCard) => {
        card.isSelected = true;
        setSelectedCards((prev) => {
            let newList = [...prev];
            newList.push(card);
            return newList;
        });
    }

    const replaceFreeCellByIndex = (index: number) => {
        selectedCards[0].isSelected = false;
        setFreeCells((prev) => {
            const updatedList = [...prev];
            updatedList.splice(index, 1, selectedCards[0]);
            return updatedList;
        });
        columns[selectedCards[0].columnPosition] = columns[selectedCards[0].columnPosition].slice(0, -selectedCards.length);
    }

    const replaceFoundationCellByIndex = (index: number) => {
        selectedCards[0].isSelected = false;
        setFoundationCells((prev) => {
            const updatedList = [...prev];
            updatedList.splice(index, 1, selectedCards[0]);
            return updatedList;
        });
        columns[selectedCards[0].columnPosition] = columns[selectedCards[0].columnPosition].slice(0, -selectedCards.length);
    }

    // Handling clicks on card columns
    const handleColumnClick = (index: number) => {
        // If there are no selected cards - select the current one
        if (selectedCards.length == 0) {
            const currentCard = columns[index][columns[index].length - 1];
            currentCard.columnPosition = index;
            currentCard.isSelected = !currentCard.isSelected;
            setSelectedCards([currentCard]);
            setColumns(columns);
        } else {
            //  When clicking again on the column with the selected card
            if (index == selectedCards[0].columnPosition) {
                // If the number of selected cards is less than or equal to the number of super moves
                if (selectedCards.length <= supermoves) {
                    let nextCardIndex = columns[index].length - selectedCards.length - 1;
                    if (nextCardIndex >= 0) {
                        let nextCard = columns[index][nextCardIndex];
                        let lastSelectedCard = selectedCards[selectedCards.length - 1];

                        // Select the next card if it has a different color and its rank is 1 more than the currently selected one.
                        if (nextCard.isRed != lastSelectedCard.isRed
                            && Number(nextCard.rank) == Number(lastSelectedCard.rank) + 1) {
                            addToSelectedCard(nextCard);
                            setColumns(columns);
                        } else {
                            setSelectedCards([]);
                            unselectColumnByIndex(index);
                        }
                    }
                } else {
                    setSelectedCards([]);
                    unselectColumnByIndex(index);
                }

                // If the selected card from a free cell
            } else if (selectedCards[0].isInFreeCell) {
                const currentColumnCard = columns[index][columns[index].length - 1];
                const selectedCard = selectedCards[0];

                // When clicking on a column from a free cell, move the card if the first of them 
                // has a different color and its rank is 1 more than the currently selected one.
                if (currentColumnCard.isRed != selectedCard.isRed
                    && Number(currentColumnCard.rank) == Number(selectedCard.rank) + 1) {

                    removeCardFromFreeCells(selectedCard);
                    columns[index].push(selectedCard);

                    setSelectedCards([]);
                    setColumns(columns);
                    calculateMaxMovableCards();
                } else {
                    unselectSelectedCards();
                }

                // If the selected card is from another column
            } else {
                const currentColumnCard = columns[index][columns[index].length - 1];
                let lastSelectedCard = selectedCards[selectedCards.length - 1];

                // When clicking on another column, move the selected cards if the first of them 
                // has a different color and its rank is 1 more than the currently selected one.
                if ((currentColumnCard.isRed != lastSelectedCard.isRed
                    && Number(currentColumnCard.rank) == Number(lastSelectedCard.rank) + 1) || columns[index].length == 0) {

                    for (const card of columns[index]) {
                        card.isSelected = false;
                    }
                    for (const card of columns[selectedCards[0].columnPosition]) {
                        card.isSelected = false;
                    }

                    let movedCards = columns[selectedCards[0].columnPosition].slice(-selectedCards.length);
                    for (const card of movedCards) {
                        card.dustAnimationState = 3;
                    }

                    columns[selectedCards[0].columnPosition] = columns[selectedCards[0].columnPosition].slice(0, -selectedCards.length);
                    columns[index].push(...movedCards);

                    setSelectedCards([]);
                    setColumns(columns);
                    calculateMaxMovableCards();
                } else {
                    let columnIndex = selectedCards[0].columnPosition
                    setSelectedCards([]);
                    unselectColumnByIndex(columnIndex);
                }
            }
        }
    };

    // Handling clicking on empty cells
    const handleFreeCellClick = (index: number) => {
        if (selectedCards.length == 1) {
            // If the chosen card is not an ace
            if (selectedCards[0].rank != CardRank.Ace) {
                // If the cell is empty
                if (freeCells[index] == null) {
                    // If the card was selected from a free cell
                    if (selectedCards[0].isInFreeCell) {
                        moveCardInFreeCellsByIndex(index);
                        setSelectedCards([]);
                    } else {
                        replaceFreeCellByIndex(index);
                        setSelectedCards([]);
                        setColumns(columns);
                        calculateMaxMovableCards();
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
            addToSelectedCard(freeCellCard);
        }
    };

    // Handling clicking on foundation cells
    const handleFoundationCellClick = (index: number) => {
        if (selectedCards.length == 1) {
            // If the cell is empty
            if (foundationCells[index] == null) {
                // If the chosen card is an ace
                if (selectedCards[0].rank == CardRank.Ace) {
                    replaceFoundationCellByIndex(index);
                    setSelectedCards([]);
                    setColumns(columns);
                    calculateMaxMovableCards();
                } else {
                    unselectSelectedCards();
                }

                // If the selected cell is not empty, the selected card has the same suit 
                // and its rank is 1 higher than the card in the selected cell
            } else if (selectedCards[0].suit == foundationCells[index].suit) {
                if (foundationCells[index].rank == CardRank.Ace && selectedCards[0].rank == CardRank.Two
                    || Number(foundationCells[index].rank) + 1 == Number(selectedCards[0].rank)
                ) {
                    replaceFoundationCellByIndex(index);
                    setSelectedCards([]);
                    setColumns(columns);
                    calculateMaxMovableCards();
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
