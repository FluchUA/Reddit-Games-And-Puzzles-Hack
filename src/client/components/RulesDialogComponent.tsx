interface RulesDialogProps {
    onDialogClose: () => void;
}

export function RulesDialogComponent({ onDialogClose }: RulesDialogProps) {
    return (
        // Внешнее затемнение на весь экран
        <div className="modal-overlay">

            {/* Окно диалога. Картинка-декор dialog_background2 теперь задана через CSS-фон */}
            <div className="modal-dialog-box">

                {/* Контейнер для текста со скроллом */}
                <div className="modal-scroll-content">
                    <h2 className="modal-title">Rules for FreeCell</h2>

                    <p className="modal-text">
                        The game uses a standard deck of 52 cards, dealt face-up into eight columns. Four columns have seven cards each, and the remaining four have six cards each. The game board also includes four free cells for temporarily holding cards and four foundation piles for collecting cards in order, starting with the Ace and ending with the King. There are 4 cells with a wooden stand and 4 cells with a vine in my slitistik that says you can't get the card back.
                    </p>
                    <p className="modal-text">
                        Cards can be moved between columns following a descending order and alternating colors. To move, it is necessary to click on a column by selecting a map and click on another column to move following the rules. Or click again on the current column if it is necessary to select the next card following the rules. For example, only a black six can be placed on a red seven. Any card can be moved to a free cell, but each free cell can hold only one card. To move a card to a foundation pile, you must start with an Ace and continue in suit order up to the King.
                    </p>
                    <p className="modal-text">
                        If there are free cells or empty columns, you can move multiple cards at once as a sequence, maintaining their order. The more free cells and empty columns you have, the more cards you can move in one go. The number of cards moved in one move is called super moves.
                    </p>
                    <p className="modal-text">
                        The goal of the game is to move all the cards from the columns and free cells to the foundation piles. The game is won when all cards are sorted into their respective suits.
                    </p>

                    {/* Переиспользуем твой класс .clickable-button для ховер-эффектов */}
                    <img
                        src="/buttons/b_ok.png"
                        alt="Ok button"
                        className="clickable-button btn-ok"
                        onClick={onDialogClose}
                    />
                </div>
            </div>
        </div>
    );
}

export default RulesDialogComponent;




