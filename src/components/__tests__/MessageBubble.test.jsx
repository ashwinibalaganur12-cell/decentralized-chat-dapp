import { render, screen } from '@testing-library/react';
import MessageBubble from '../MessageBubble';

describe('MessageBubble', () => {
    const mockMessage = {
        id: 1,
        content: 'Hello World',
        timestamp: new Date('2023-01-01T12:00:00').getTime(),
        isOwn: false,
    };

    it('renders message content correctly', () => {
        render(<MessageBubble message={mockMessage} isOwn={false} />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders timestamp correctly', () => {
        render(<MessageBubble message={mockMessage} isOwn={false} />);
        // Time format depends on locale, checking for presence
        expect(screen.getByText(/12:00/)).toBeInTheDocument();
    });

    it('applies correct class for own message', () => {
        const { container } = render(<MessageBubble message={mockMessage} isOwn={true} />);
        expect(container.firstChild).toHaveClass('own');
    });

    it('applies correct class for other message', () => {
        const { container } = render(<MessageBubble message={mockMessage} isOwn={false} />);
        expect(container.firstChild).toHaveClass('other');
    });
    it('renders sender name when provided and not own message', () => {
        render(<MessageBubble message={mockMessage} isOwn={false} senderName="Alice" />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('does not render sender name for own message', () => {
        render(<MessageBubble message={mockMessage} isOwn={true} senderName="Alice" />);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
});
