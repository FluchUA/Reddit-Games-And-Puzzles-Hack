import { Devvit } from '@devvit/public-api';

interface VictoryDialogProps {
    onDialogClose: () => void;
}

export function VictoryDialogComponent({ onDialogClose }: VictoryDialogProps) {
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

            {/* <image
                url='white_pixel.png'
                description='White pixel to set the dialog background'
                imageHeight={1}
                imageWidth={1}
                height="420px"
                width="420px"
                resizeMode='fill'
            /> */}

            <vstack height="100%" width="400px" alignment="center middle" gap="medium">
                <text size="xlarge" weight="bold" color='#FFFFFF'>Victory</text>

                <button appearance="primary" onPress={onDialogClose}>OK</button>
            </vstack>
        </zstack>
    );
};

export default VictoryDialogComponent;
