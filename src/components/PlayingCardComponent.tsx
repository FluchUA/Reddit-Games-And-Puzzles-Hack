import { PlayingCard } from '../models/PlayingCard.js';
import { Devvit, useState, useInterval } from '@devvit/public-api';

interface PlayingCardProps {
    card: PlayingCard;
    cardIndex: number;
}

export function PlayingCardComponent({ card, cardIndex }: PlayingCardProps) {
    return (
        <zstack height="100%" width="100%" alignment="center top">
            <vstack height="100%" width="100%" alignment="center top">
                <image
                    url='empty_pixel.png'
                    description='Blank pixel for adding indents of playing cards'
                    imageHeight={1}
                    imageWidth={1}
                    height={2.8 * cardIndex}
                    resizeMode='none'
                />
                <image
                    url={card.assetPath}
                    description={`${card.rank} of ${card.suit}`}
                    imageHeight={61}
                    imageWidth={45}
                    resizeMode='none'
                />
            </vstack>

            {/* Card level */}
            <vstack height="100%" width="100%" alignment="center top">
                <image
                    url='empty_pixel.png'
                    description='Blank pixel for adding indents of playing cards'
                    imageHeight={1}
                    imageWidth={1}
                    height={2.8 * cardIndex}
                    resizeMode='none'
                />
                <image
                    url={card.cardLvlPath}
                    description='Path to level card sprite'
                    imageHeight={6}
                    imageWidth={10}
                    resizeMode='none'
                />
            </vstack>

            {/* Select card */}
            {card.isSelected && (
                <vstack height="100%" width="100%" alignment="center top">
                    <image
                        url='empty_pixel.png'
                        description='Blank pixel for adding indents of playing cards'
                        imageHeight={1}
                        imageWidth={1}
                        height={2.8 * cardIndex}
                        resizeMode='none'
                    />
                    <image
                        url='cards/selected_card.png'
                        description='Selected card overlay'
                        imageHeight={61}
                        imageWidth={45}
                        resizeMode='none'
                    />
                </vstack>
            )}
        </zstack>
    );
}
