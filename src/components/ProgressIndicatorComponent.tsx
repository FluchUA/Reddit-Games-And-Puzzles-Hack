import { Devvit } from '@devvit/public-api';

export function ProgressIndicatorComponent() {
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
                url='loading.gif'
                description='Animated progress indicator'
                imageHeight={50}
                imageWidth={50}
                resizeMode='none'
            />
        </zstack>
    );
};

export default ProgressIndicatorComponent;
