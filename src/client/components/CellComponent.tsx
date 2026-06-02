import { PlayingCard } from '../models/PlayingCard';

interface CellProps {
    card: PlayingCard | null;
    isFreeCell: boolean;
}

export function CellComponent({ card, isFreeCell }: CellProps) {
    return (
        <>
            {card ? (
                <>
                    {/* Card */}
                    <img src={`/${card.assetPath}`} alt={`${card.rank} of ${card.suit}`} className="card-layer" />

                    {/* Card level */}
                    <img src={`/${card.cardLvlPath}`} alt="Card level" className="card-layer card-level" />

                    {/* Foundation overlay */}
                    {!isFreeCell && (<img src="/cards/card_foundation_cell.png" alt="Foundation foreground" className="card-layer" />)}
                </>
            ) : (
                <>
                    {/* Empty Cell */}
                    <img src="/cards/card_free_cell.png" alt="Empty cell" className="card-layer" />

                    {/* Foundation overlay */}
                    {!isFreeCell && (<img src="/cards/card_foundation_cell.png" alt="Foundation foreground" className="card-layer" />)}
                </>
            )}

            {/* Card Selection */}
            {card?.isSelected === true && (<img src="/cards/selected_card.png" alt="Selected card overlay" className="card-layer" />)}
        </>
    );
}