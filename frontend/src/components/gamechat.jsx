import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import socket from '../app/socket';
import '../css/gamechat.css';

function GameChat({ roomId, setFocused }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const chatboxRef = useRef(null);

    useEffect(() => {
        socket.on('newMessage', (messageInfo) => {
            setMessages((prevMessages) => [...prevMessages, messageInfo]);
            if (chatboxRef.current) {
                chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
            }
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

    const sendMessage = () => {
        if (inputMessage.trim() === '') return;

        socket.emit('sendMessage', { roomId, message: inputMessage });
        setInputMessage('');
    };

    return (
        <div className="game-chat">
            <h3>Chat</h3>
            <div className="chat-box" ref={chatboxRef}>
                {messages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        {msg.message.slice(-4) !== '.gif' ? (
                            <>
                                <strong>{msg.playerId}:</strong> {msg.message}
                            </>
                        ) : (
                            <>
                                <strong>{msg.playerId}:</strong> <img className="chat-message-gif" width={250} src={msg.message} alt="gif" />
                            </>
                        )}
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
                    onFocus={() => setFocused(false)}
                    onBlur={() => setFocused(true)}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}

export default GameChat;
