import { useState } from 'react';

export const useCommandModal = () => {
    const [showCommandParticipants, setShowCommand] = useState<boolean>(false);
    const handleShowCommandParticipants = () => setShowCommand(true);
    const handleCloseCommandParticipants = () => setShowCommand(false);

    return {
        showCommandParticipants,
        handleCloseCommandParticipants,
        handleShowCommandParticipants,
    };
};
