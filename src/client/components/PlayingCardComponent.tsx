import { PlayingCard } from '../models/PlayingCard';

interface PlayingCardProps {
  card: PlayingCard;
  cardIndex: number;
}

export function PlayingCardComponent({ card, cardIndex }: PlayingCardProps) {
  const cardStyle = { '--card-index': cardIndex } as React.CSSProperties;

  return (
    <div className="slot-cell-trigger" style={cardStyle}>
      {/* Card */}
      <img src={`/${card.assetPath}`} alt={`${card.rank} of ${card.suit}`} className="card-layer" />

      {/* Card level */}
      <img src={`/${card.cardLvlPath}`} alt="Card level" className="card-layer card-level" />

      {/* Card Selection */}
      {card.isSelected && (<img src="/cards/selected_card.png" alt="Selected card overlay" className="card-layer" />)}
    </div>
  );
}