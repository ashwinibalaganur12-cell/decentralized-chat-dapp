import { render, screen, fireEvent } from '@testing-library/react';
import ConnectWallet from '../ConnectWallet';
import { vi } from 'vitest';

describe('ConnectWallet', () => {
    it('renders welcome message', () => {
        render(<ConnectWallet onConnect={() => { }} />);
        expect(screen.getByText('Welcome to Chat DApp')).toBeInTheDocument();
    });

    it('calls onConnect when button is clicked', () => {
        const mockOnConnect = vi.fn();
        render(<ConnectWallet onConnect={mockOnConnect} />);

        const button = screen.getByText('Connect MetaMask');
        fireEvent.click(button);

        expect(mockOnConnect).toHaveBeenCalledTimes(1);
    });
});
