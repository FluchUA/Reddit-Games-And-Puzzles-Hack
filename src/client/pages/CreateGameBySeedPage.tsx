import { useState } from 'react';

interface CreateGameBySeedPageProps {
    onBackToMenu: () => void;
    onStartGame: (seed: string) => void;
}

export function CreateGameBySeedPage({ onBackToMenu, onStartGame }: CreateGameBySeedPageProps) {
    const [seed, setSeed] = useState<string>("------");

    function onNumberPressed(value: number) {
        const firstDashIndex = seed.indexOf('-');
        if (firstDashIndex !== -1) {
            const newSeed = seed.slice(0, firstDashIndex) + value + seed.slice(firstDashIndex + 1);
            setSeed(newSeed);
        }
    }

    function onCancelPressed() {
        if (!seed.match(/[^-]/)) return;

        const lastFilledIndex = seed.lastIndexOf(seed.match(/[^-]/g)?.pop() ?? '');
        if (lastFilledIndex !== -1) {
            const newSeed = seed.slice(0, lastFilledIndex) + '-' + seed.slice(lastFilledIndex + 1);
            setSeed(newSeed);
        }
    }

    function onResetPressed() {
        setSeed("------");
    }

    return (
        <div className="main-container">

            {/* Background */}
            <img src="/background.png" alt="Background" className="bg-main" />
            <img src="/interface_background/dialog_background2.png" alt="Dialog background" className="bg-main-container" />

            {/* Back Button */}
            <img src="/buttons/b_back.png" alt="Back" className="clickable-button btn-back-top-left" onClick={onBackToMenu} />

            {/* Content */}
            <div className="content-layer">
                <h2 className="text-xxlarge bold-text text-center">  Enter the seed of the game </h2>
                <p className="text-medium text-center"> Please be aware that you will receive a reduced number of experience points if they have previously won the game </p>

                {/* Seed Value */}
                <p className="text-medium bold-text text-center"> {seed} </p>

                {/* Buttons: 1-6 */}
                <div className="seed-buttons-row">
                    {[1, 2, 3, 4, 5, 6].map(n => (<img key={n} src={`/buttons/b_${n}.png`} alt={`Button ${n}`} className="clickable-button" onClick={() => onNumberPressed(n)} />))}
                </div>

                {/* Buttons: clear, 7-9, 0, reset */}
                <div className="seed-buttons-row">
                    <img src="/buttons/b_clear.png" alt="Clear" className="clickable-button" onClick={onCancelPressed} />

                    {[7, 8, 9, 0].map(n => (<img key={n} src={`/buttons/b_${n}.png`} alt={`Button ${n}`} className="clickable-button" onClick={() => onNumberPressed(n)} />))}

                    <img src="/buttons/b_X.png" alt="Reset" className="clickable-button" onClick={onResetPressed} />
                </div>

                {/* Start Button */}
                <img src="/buttons/b_start_game.png" alt="Start Game" className="clickable-button" onClick={() => onStartGame(seed)} />
            </div>
        </div>
    );
}