import { gameState, update } from './game.js';
import { render } from './ui.js';

let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Update game logic
    update(deltaTime);

    // Render the new state
    render(gameState);

    requestAnimationFrame(gameLoop);
}

// Start the game loop
requestAnimationFrame(gameLoop);