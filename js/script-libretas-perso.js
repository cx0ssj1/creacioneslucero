function updateQuantity(change) {
    const input = document.getElementById('quantity');
    const newValue = parseInt(input.value) + change;
    if (newValue >= 1) {
        input.value = newValue;
    }
}

function updateMainImage(thumbnail) {
    document.getElementById('mainImage').src = thumbnail.src;
    document.querySelectorAll('.product-gallery img').forEach(img => {
        img.classList.remove('active');
    });
    thumbnail.classList.add('active');
}