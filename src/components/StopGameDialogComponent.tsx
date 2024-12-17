import { Devvit } from '@devvit/public-api';

const TEXT_COLOR = '#000000';

interface StopGameDialogProps {
    onBackToMenu: () => void;
    onDialogClose: () => void;
}

export function StopGameDialogComponent({ onBackToMenu, onDialogClose }: StopGameDialogProps) {
    return (
        <zstack height="100%" width="100%" alignment="center middle" gap="medium">
            <image
                url='dark_transparent_pixel.png'
                description='Semi-transparent pixel to darken the background'
                imageHeight={1}
                imageWidth={1}
                height="100%"
                width="100%"
                resizeMode='fill'
            />

            <image
                url='white_pixel.png'
                description='White pixel to set the dialog background'
                imageHeight={1}
                imageWidth={1}
                height="150px"
                width="400px"
                resizeMode='fill'
            />

            <vstack height="100%" width="350px" alignment="center middle" gap="medium">
                <text size="large" wrap={true} weight="bold" color={TEXT_COLOR}>Hold on! Leaving the game now means losing your progress. Do you want to go back to the menu?</text>

                <hstack width="100%" alignment="center middle" gap="small">
                    <image url='buttons/b_exit_to_menu.png' description='Exit to menu button' imageHeight={40} imageWidth={203} resizeMode='none' onPress={onBackToMenu} />
                    <image url='buttons/b_continue_playing.png' description='Continue playing button' imageHeight={40} imageWidth={219} resizeMode='none' onPress={onDialogClose} />
                </hstack>
            </vstack>
        </zstack>
    );
};

export default StopGameDialogComponent;
