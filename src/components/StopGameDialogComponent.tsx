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
                url='interface_background/small_dialog_background.png'
                description='Dialog background'
                imageHeight={410}
                imageWidth={410}
                resizeMode='none'
            />

            <text height="150px" width="300px" alignment="center top" size="xlarge" wrap={true} selectable={false} color={TEXT_COLOR}>Hold on! Leaving the game now means losing your progress. Do you want to go back to the menu?</text>

            <vstack height="230px" width="420px" alignment="center bottom" gap="small">
                <image url='buttons/b_exit_to_menu.png' description='Exit to menu button' imageHeight={40} imageWidth={203} resizeMode='none' onPress={onBackToMenu} />
                <image url='buttons/b_continue_playing.png' description='Continue playing button' imageHeight={40} imageWidth={219} resizeMode='none' onPress={onDialogClose} />
            </vstack>
        </zstack>
    );
};

export default StopGameDialogComponent;
