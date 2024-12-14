import { Devvit } from '@devvit/public-api';

const TEXT_COLOR = '#000000';

interface RulesDialogProps {
    onDialogClose: () => void;
}

export function RulesDialogComponent({ onDialogClose }: RulesDialogProps) {
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
                height="420px"
                width="420px"
                resizeMode='fill'
            />

            <vstack height="100%" width="400px" alignment="center middle" gap="medium">
                <text size="xlarge" weight="bold" color={TEXT_COLOR}>Rules for FreeCell</text>
                <text size="small" wrap={true} color={TEXT_COLOR}>The game uses a standard deck of 52 cards, dealt face-up into eight columns. Four columns have seven cards each, and the remaining four have six cards each. The game board also includes four free cells for temporarily holding cards and four foundation piles for collecting cards in order, starting with the Ace and ending with the King.</text>
                <text size="small" wrap={true} color={TEXT_COLOR}>Cards can be moved between columns following a descending order and alternating colors. For example, only a black six can be placed on a red seven. Any card can be moved to a free cell, but each free cell can hold only one card. To move a card to a foundation pile, you must start with an Ace and continue in suit order up to the King.</text>
                <text size="small" wrap={true} color={TEXT_COLOR}>If there are free cells or empty columns, you can move multiple cards at once as a sequence, maintaining their order. The more free cells and empty columns you have, the more cards you can move in one go.</text>
                <text size="small" wrap={true} color={TEXT_COLOR}>The goal of the game is to move all the cards from the columns and free cells to the foundation piles. The game is won when all cards are sorted into their respective suits.</text>

                <button appearance="primary" onPress={onDialogClose}>OK</button>
            </vstack>
        </zstack>
    );
};

export default RulesDialogComponent;
