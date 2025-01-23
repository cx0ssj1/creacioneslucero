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

const customSelect = document.getElementById('customSelect');
const trigger = customSelect.querySelector('.custom-select-trigger');
const options = customSelect.querySelectorAll('.custom-option');

  // Abrir y cerrar el menú desplegable
trigger.addEventListener('click', () => {
    customSelect.classList.toggle('open');
});

  // Manejar la selección de una opción
options.forEach(option => {
    option.addEventListener('click', () => {
        const value = option.getAttribute('data-value');
        trigger.textContent = option.textContent; // Cambiar el texto del disparador
        customSelect.classList.remove('open'); // Cerrar el menú
        console.log('Opción seleccionada:', value); // Puedes procesar esta selección
    });
});

  // Cerrar el menú al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
        customSelect.classList.remove('open');
    }
});