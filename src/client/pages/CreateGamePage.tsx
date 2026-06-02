interface CreateGamePageProps {
    onBackToMenu: () => void;
    onOpenCreateBySeedPage: () => void;
    onStartGame: (seed: string) => void;
}

export function CreateGamePage({ onBackToMenu, onOpenCreateBySeedPage, onStartGame }: CreateGamePageProps) {
    return (
        <div className="main-container">
            {/* Background */}
            <img src="/background.png" alt="Background" className="bg-main" />
            <img src="/interface_background/dialog_background2.png" alt="Dialog background" className="bg-main-container" />

            {/* Back Button */}
            <img src="/buttons/b_back.png" alt="Back" className="clickable-button btn-back-top-left" onClick={onBackToMenu} />

            {/* Content */}
            <div className="content-layer">

                {/* Description */}
                <p className="text-xlarge bold-text text-center"> Start a game with a seed to play a specific setup or generate a random one to explore new challenges! </p>

                {/* Buttons */}
                <div className="buttons-container margin-top-medium">
                    <img src="/buttons/b_generate_using_game_seed.png" alt="Generate using game seed" className="clickable-button" onClick={onOpenCreateBySeedPage} />
                    <img src="/buttons/b_start_random_game.png" alt="Start random game" className="clickable-button" onClick={() => onStartGame("------")} />
                </div>
            </div>
        </div>
    );
}