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
                url='interface_background/dialog_background2.png'
                description='Dialog background'
                imageHeight={470}
                imageWidth={470}
                resizeMode='none'
            />

            <vstack height="100%" width="420px" alignment="center middle" gap="small">
                <text size="xlarge" weight="bold" color={TEXT_COLOR} selectable={false}>Rules for FreeCell</text>
                <text size="xsmall" wrap={true} color={TEXT_COLOR} selectable={false}>The game uses a standard deck of 52 cards, dealt face-up into eight columns. Four columns have seven cards each, and the remaining four have six cards each. The game board also includes four free cells for temporarily holding cards and four foundation piles for collecting cards in order, starting with the Ace and ending with the King. There are 4 cells with a wooden stand and 4 cells with a vine in my slitistik that says you can't get the card back.</text>
                <text size="xsmall" wrap={true} color={TEXT_COLOR} selectable={false}>Cards can be moved between columns following a descending order and alternating colors. To move, it is necessary to click on a column by selecting a map and click on another column to move following the rules. Or click again on the current column if it is necessary to select the next card following the rules. For example, only a black six can be placed on a red seven. Any card can be moved to a free cell, but each free cell can hold only one card. To move a card to a foundation pile, you must start with an Ace and continue in suit order up to the King.</text>
                <text size="xsmall" wrap={true} color={TEXT_COLOR} selectable={false}>If there are free cells or empty columns, you can move multiple cards at once as a sequence, maintaining their order. The more free cells and empty columns you have, the more cards you can move in one go. The number of cards moved in one move is called super moves.</text>
                <text size="xsmall" wrap={true} color={TEXT_COLOR} selectable={false}>The goal of the game is to move all the cards from the columns and free cells to the foundation piles. The game is won when all cards are sorted into their respective suits.</text>

                <image url='buttons/b_ok.png' description='Ok button' imageHeight={40} imageWidth={41} resizeMode='none' onPress={onDialogClose} />
            </vstack>
        </zstack>
    );
};

export default RulesDialogComponent;
