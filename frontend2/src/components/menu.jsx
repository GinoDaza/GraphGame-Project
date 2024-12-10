import '../css/menu.css';

function Menu({ setScreen, setRoomId }) {
    return (
        <div className="menu">
            <h2>Welcome to Graph Game</h2>
            <button onClick={() => setScreen('lobby')}>Create Room</button>
            <button onClick={() => setScreen('lobby')}>Join Room</button>
            <button onClick={() => alert('Show rooms coming soon!')}>View Rooms</button>
        </div>
    );
}

export default Menu;
