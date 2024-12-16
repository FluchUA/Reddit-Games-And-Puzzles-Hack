import { PlayingCard } from '../models/PlayingCard.js';
import { Devvit, useState, useInterval } from '@devvit/public-api';

interface CellProps {
    card: PlayingCard | null;
    isFreeCell: boolean;
}

export function CallComponent({ card, isFreeCell }: CellProps) {
    const [animationState, setAnimationState] = useState(card ? card.dustAnimationState : 0);

    if (animationState > 0) {
        useInterval(() => {
            setAnimationState((prev) => prev - 1);
        }, 60).start();
    }

    const imagePaths: { [key: number]: string } = {
        3: 'anim/1.png',
        2: 'anim/2.png',
        1: 'anim/3.png',
        0: 'empty_pixel.png',
    };

    const imagePath = isFreeCell ? 'cards/card_free_cell.png' : 'cards/card_foundation_cell.png'

    return (
        <zstack height="100%" width="100%" alignment="center top">
            {animationState >= 0 && (
                <image
                    url={imagePaths[animationState]}
                    description='Animation image'
                    imageHeight={93}
                    imageWidth={68}
                    resizeMode='none'
                />
            )}

            {card ? (
                <image
                    url={card.assetPath}
                    description={`${card.rank} of ${card.suit}`}
                    imageHeight={62}
                    imageWidth={45}
                    resizeMode='none'
                />
            ) : (
                <image
                    url={imagePath}
                    description='Default background'
                    imageHeight={62}
                    imageWidth={45}
                    resizeMode='none'
                />
            )}

            {/* Select card */}
            {card?.isSelected == true && (
                <image
                    url='logo.png'
                    description='Selected card overlay'
                    imageHeight={40}
                    imageWidth={40}
                    resizeMode='none'
                />
            )}
        </zstack>
    );
}
