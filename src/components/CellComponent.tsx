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
                <zstack height="100%" width="100%" alignment="center top">
                    <image
                        url={card.assetPath}
                        description={`${card.rank} of ${card.suit}`}
                        imageHeight={61}
                        imageWidth={45}
                        resizeMode='none'
                    />

                    {/* Card level */}
                    <image
                        url={card.cardLvlPath}
                        description='Path to level card sprite'
                        imageHeight={6}
                        imageWidth={10}
                        resizeMode='none'
                    />

                    {!isFreeCell && <image
                        url={'cards/card_foundation_cell.png'}
                        description='Foundation foreground'
                        imageHeight={61}
                        imageWidth={45}
                        resizeMode='none'
                    />}
                </zstack>
            ) : (
                <zstack height="100%" width="100%" alignment="center top">
                    <image
                        url={'cards/card_free_cell.png'}
                        description='Default background'
                        imageHeight={61}
                        imageWidth={45}
                        resizeMode='none'
                    />

                    {!isFreeCell && <image
                        url={'cards/card_foundation_cell.png'}
                        description='Foundation foreground'
                        imageHeight={61}
                        imageWidth={45}
                        resizeMode='none'
                    />}
                </zstack>
            )}

            {/* Select card */}
            {card?.isSelected == true && (
                <image
                    url='cards/selected_card.png'
                    description='Selected card overlay'
                    imageHeight={61}
                    imageWidth={45}
                    resizeMode='none'
                />
            )}
        </zstack>
    );
}
