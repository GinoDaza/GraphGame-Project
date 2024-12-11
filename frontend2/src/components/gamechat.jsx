import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import socket from '../app/socket'; // Ensure socket connection
import '../css/gamechat.css';

function GameChat({ roomId }) {
    const [messages, setMessages] = useState([]); // Chat messages
    const [inputMessage, setInputMessage] = useState(''); // Current message input
    const chatboxRef = useRef(null);

    // Listen for new messages from the server

    useEffect(() => {
        socket.on('newMessage', (messageInfo) => {
            if (chatboxRef.current) {
                chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
            }
            setMessages((prevMessages) => [...prevMessages, messageInfo]);
        });

        return () => {
            socket.off('newMessage');
        };
    }, []);

    useLayoutEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    // Handle sending a message
    const sendMessage = () => {
        if (inputMessage.trim() === '') return; // Avoid sending empty messages

        // Emit the message to the server
        socket.emit('sendMessage', { roomId, message: inputMessage });

        // Add the message to the local chat (optional, depending on server echo)
        //setMessages((prevMessages) => [...prevMessages, { playerId: 'You', message: inputMessage }]);

        // Clear the input
        setInputMessage('');
    };

    return (
        <div className="game-chat">
            <h3>Chat</h3>
            <div className="chat-box" ref={chatboxRef}>
                {messages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        { msg.message.slice(-4) !== '.gif' ?
                        <><strong>{msg.playerId}:</strong> {msg.message} </>:
                        <><strong>{msg.playerId}: </strong> <img className='chat-message-gif' width={250} src={msg.message}/> </>
                        }
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
