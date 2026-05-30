import { PlayingCard } from '../models/PlayingCard';

interface PlayingCardProps {
  card: PlayingCard;
  cardIndex: number;
}

export function PlayingCardComponent({ card, cardIndex }: PlayingCardProps) {
  // cardIndex — это порядковый номер карты в колонке (0, 1, 2, 3...)
  const cardStyle = { '--card-index': cardIndex } as React.CSSProperties;

  return (
    /* Передаем индекс карты внутрь CSS через style, остальное сделает класс */
    <div className="cascaded-card-container" style={cardStyle}>

      {/* Карта */}
      <img
        src={`/${card.assetPath}`}
        alt={`${card.rank} of ${card.suit}`}
        className="cascaded-card-layer"
      />

      {/* Уровень карты */}
      <img
        src={`/${card.cardLvlPath}`}
        alt="Card level"
        className="cascaded-card-layer cascaded-card-level"
      />

      {/* Выделение карты */}
      {card.isSelected && (
        <img
          src="/cards/selected_card.png"
          alt="Selected card overlay"
          className="cascaded-card-layer"
        />
      )}
    </div>
  );
}