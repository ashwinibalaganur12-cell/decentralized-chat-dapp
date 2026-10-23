import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatWindow from '../ChatWindow';
import { vi } from 'vitest';

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
        loading: vi.fn(),
    },
    toast: {
        success: vi.fn(),
        error: vi.fn(),
        dismiss: vi.fn(),
        loading: vi.fn(),
    }
}));

vi.mock('../MessageBubble', () => ({
    default: ({ message }) => <div data-testid="message-bubble">{message.content}</div>
}));

vi.mock('../CallModal', () => ({
    default: () => <div data-testid="call-modal" />
}));

vi.mock('emoji-picker-react', () => ({
    default: () => <div data-testid="emoji-picker" />
}));

describe('ChatWindow', () => {
    const mockActiveChat = { id: 1, name: 'Test Chat', type: 'direct', address: '0x123' };
    const mockMessages = [
        { id: 1, content: 'Hi', timestamp: Date.now(), isOwn: false, senderAddress: '0x123' },
    ];

    let mockOnSendMessage;

    beforeEach(() => {
        mockOnSendMessage = vi.fn().mockResolvedValue(true);
    });

    it('renders placeholder when no active chat', () => {
        render(<ChatWindow activeChat={null} messages={[]} onSendMessage={mockOnSendMessage} friendList={[]} />);
        expect(screen.getByText('Select a chat to start messaging')).toBeInTheDocument();
    });

    it('renders chat header and messages when active chat is selected', () => {
        render(<ChatWindow activeChat={mockActiveChat} messages={mockMessages} onSendMessage={mockOnSendMessage} friendList={[]} />);
        expect(screen.getByText('Test Chat')).toBeInTheDocument();
        expect(screen.getByText('Hi')).toBeInTheDocument();
    });

    it('calls onSendMessage when form is submitted', async () => {
        const { container } = render(<ChatWindow activeChat={mockActiveChat} messages={mockMessages} onSendMessage={mockOnSendMessage} friendList={[]} />);

        const input = screen.getByPlaceholderText('Type a message... (Shift+Enter for new line)');
        fireEvent.change(input, { target: { value: 'New Message' } });

        const form = container.querySelector('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(mockOnSendMessage).toHaveBeenCalledWith('New Message');
        });
    });
});
