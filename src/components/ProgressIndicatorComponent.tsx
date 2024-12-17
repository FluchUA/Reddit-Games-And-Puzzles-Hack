import { Devvit } from '@devvit/public-api';

interface ProgressIndicatorComponentProps {
    isDarkBackground: boolean;
}

export function ProgressIndicatorComponent({ isDarkBackground }: ProgressIndicatorComponentProps) {
    return (
        <zstack height="100%" width="100%" alignment="center middle" gap="medium">

            {isDarkBackground ? (
                <image
                    url='dark_background.png'
                    description='Background'
                    imageHeight={530}
                    imageWidth={777}
                    resizeMode='none'
                />
            ) : (
                <image
                    url='dark_transparent_pixel.png'
                    description='Semi-transparent pixel to darken the background'
                    imageHeight={1}
                    imageWidth={1}
                    height="100%"
                    width="100%"
                    resizeMode='fill'
                />
            )
            }

            <image
                url='loading.gif'
                description='Animated progress indicator'
                imageHeight={164}
                imageWidth={164}
                resizeMode='none'
            />
        </zstack>
    );
};

export default ProgressIndicatorComponent;
