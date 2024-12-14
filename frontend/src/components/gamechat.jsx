/* gamechat.jsx */

import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import socket from '../app/socket'; // Asegúrate de que la conexión de socket está correcta
import '../css/gamechat.css';

function GameChat({ roomId, setFocused }) {
    const [messages, setMessages] = useState([]); // Mensajes del chat
    const [inputMessage, setInputMessage] = useState(''); // Mensaje actual en el input
    const chatboxRef = useRef(null);

    // Escuchar nuevos mensajes desde el servidor
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

    // Scroll automático al final cuando se actualizan los mensajes
    useLayoutEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    // Manejar el envío de un mensaje
    const sendMessage = () => {
        if (inputMessage.trim() === '') return; // Evitar enviar mensajes vacíos

        // Emitir el mensaje al servidor
        socket.emit('sendMessage', { roomId, message: inputMessage });

        // Limpiar el input
        setInputMessage('');
    };

    return (
        <>
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
        </>
    );
}

export default GameChat;
