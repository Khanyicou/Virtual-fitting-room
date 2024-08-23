document.getElementById('upload-image').addEventListener('change', function(event) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Resize canvas to match image size
            canvas.width = img.width;
            canvas.height = img.height;
            // Draw uploaded image on canvas
            ctx.drawImage(img, 0, 0, img.width, img.height);
        };
        img.src = e.target.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});

