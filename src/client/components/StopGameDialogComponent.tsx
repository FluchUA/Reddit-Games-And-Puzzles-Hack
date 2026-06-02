interface StopGameDialogProps {
    onBackToMenu: () => void;
    onDialogClose: () => void;
}

export function StopGameDialogComponent({ onBackToMenu, onDialogClose }: StopGameDialogProps) {
    return (
        <div className="modal-overlay">

            {/* Dialog Background */}
            <div className="modal-dialog-box small-dialog">

                {/* Content */}
                <div className="small-modal-dialog-content">

                    {/* Description */}
                    <p className="text-medium margin-bottom-small">  Hold on! Leaving the game now means losing your progress. Do you want to go back to the menu? </p>

                    {/* Buttons */}
                    <div className="modal-action-buttons">
                        <img src="/buttons/b_exit_to_menu.png" alt="Exit to menu button" className="clickable-button-medium" onClick={onBackToMenu} />
                        <img src="/buttons/b_continue_playing.png" alt="Continue playing button" className="clickable-button-medium" onClick={onDialogClose} />
                    </div>

                </div>
            </div>
        </div>
    );
}

export default StopGameDialogComponent;