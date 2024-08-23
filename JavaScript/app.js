let imageNumber = 0;

document.getElementById('nextShirt').addEventListener('click', () => {
    imageNumber = (imageNumber + 1) % shirts.length;
    updateShirt();
});

document.getElementById('prevShirt').addEventListener('click', () => {
    imageNumber = (imageNumber - 1 + shirts.length) % shirts.length;
    updateShirt();
});

function updateShirt() {
    // Call backend to update the imageNumber and reprocess the video frame
}

