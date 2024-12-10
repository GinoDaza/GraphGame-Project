import { useState } from 'preact/hooks';
import socket from '../app/socket'; // Ensure socket connection
import '../css/gamechat.css';

function GameChat() {
    const [messages, setMessages] = useState([]); // Chat messages
    const [inputMessage, setInputMessage] = useState(''); // Current message input

    // Listen for new messages from the server
    socket.on('sendMessage', (messageInfo) => {
        setMessages((prevMessages) => [...prevMessages, messageInfo]);
    });

    // Handle sending a message
    const sendMessage = () => {
        if (inputMessage.trim() === '') return; // Avoid sending empty messages

        // Emit the message to the server
        socket.emit('sendMessage', { message: inputMessage });

        // Add the message to the local chat (optional, depending on server echo)
        setMessages((prevMessages) => [...prevMessages, { playerId: 'You', message: inputMessage }]);

        // Clear the input
        setInputMessage('');
    };

    return (
        <div className="game-chat">
            <h3>Chat</h3>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        <strong>{msg.playerId}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onInput={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default GameChat;
