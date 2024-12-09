function initializeGameUI() {
    const gameContainer = document.getElementById('game-container');

    // Create the form
    const form = document.createElement('form');
    form.id = 'math-function-form';
    form.style.position = 'absolute';
    form.style.bottom = '20px';
    form.style.left = '50%';
    form.style.transform = 'translateX(-50%)';
    form.style.display = 'flex';
    form.style.alignItems = 'center';
    form.style.gap = '10px';

    // Input for the mathematical function
    const input = document.createElement('input');
    input.id = 'math-function-input';
    input.type = 'text';
    input.placeholder = 'Enter function (e.g., cos(10x))';
    input.style.padding = '10px';
    input.style.fontSize = '16px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '5px';
    input.style.width = '300px';

    // Fire button
    const button = document.createElement('button');
    button.type = 'submit';
    button.textContent = 'Fire';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.cursor = 'pointer';

    // Append elements to the form
    form.appendChild(input);
    form.appendChild(button);

    // Append the form to the game container
    gameContainer.appendChild(form);

    // Handle the submit event
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        const mathFunction = input.value.trim();
        if (mathFunction) {
            console.log(`Function submitted: ${mathFunction}`);
            input.value = ''; // Clear the input after submission
        }
    });
}
