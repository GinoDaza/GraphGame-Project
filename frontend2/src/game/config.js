const gameConfig = {
    type: Phaser.AUTO, // Motor de renderizado automático (WebGL o Canvas)
    width: 1024,       // Ancho del canvas del juego
    height: 768,       // Altura del canvas del juego
    backgroundColor: '#000000', // Color de fondo del canvas
    physics: {
        default: 'arcade', // Motor de físicas
        arcade: {
            gravity: { y: 0 }, // Sin gravedad (ajustar según el juego)
            debug: false,     // Modo depuración
        },
    },
    parent: 'game-container', // ID del contenedor donde se montará el canvas
};

export default gameConfig;
