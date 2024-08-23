let imageNumber = 0;

document.getElementById('nextShirt').addEventListener('click', () => {
    imageNumber = (imageNumber + 1) % 3; // Assuming 3 shirts
    updateShirt();
});

document.getElementById('prevShirt').addEventListener('click', () => {
    imageNumber = (imageNumber - 1 + 3) % 3; // Assuming 3 shirts
    updateShirt();
});

function updateShirt() {
    // You could implement an AJAX call to the backend to update the imageNumber
}

