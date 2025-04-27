// js/utils.js
window.showNotification = function(message, type = 'success', duration = 4000) {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'toast-notification';
    
    // Determinar el color del borde según el tipo
    let borderColor;
    let iconHTML;
    
    switch(type) {
        case 'success':
            borderColor = '#28a745'; // verde
            iconHTML = '<i class="bi bi-check-circle-fill" style="color: #28a745; margin-right: 10px; font-size: 20px;"></i>';
            break;
        case 'error':
            borderColor = '#dc3545'; // rojo
            iconHTML = '<i class="bi bi-exclamation-circle-fill" style="color: #dc3545; margin-right: 10px; font-size: 20px;"></i>';
            break;
        case 'warning':
            borderColor = '#ffc107'; // amarillo
            iconHTML = '<i class="bi bi-exclamation-triangle-fill" style="color: #ffc107; margin-right: 10px; font-size: 20px;"></i>';
            break;
        case 'info':
            borderColor = '#17a2b8'; // azul
            iconHTML = '<i class="bi bi-info-circle-fill" style="color: #17a2b8; margin-right: 10px; font-size: 20px;"></i>';
            break;
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: rgb(255, 255, 255);
        color: #333;
        border-left: 4px solid ${borderColor};
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        padding: 16px;
        border-radius: 4px;
        z-index: 9999;
        max-width: 350px;
        min-width: 250px;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start;">
            ${iconHTML}
            <div style="flex-grow: 1;">
                ${message}
            </div>
            <button class="close-notification" style="background: none; border: none; cursor: pointer; font-size: 20px; margin-left: 8px; color: #6c757d;">×</button>
        </div>
    `;
    
    // Agregar al body
    document.body.appendChild(notification);
    
    // Mostrar con efecto fade in
    setTimeout(() => {
        notification.style.opacity = '1';
        
        // Cerrar después del tiempo especificado
        const timeoutId = setTimeout(() => {
            closeNotification(notification);
        }, duration);
        
        // Guardar el timeoutId en el elemento para poder cancelarlo si se cierra manualmente
        notification.dataset.timeoutId = timeoutId;
    }, 100);
    
    // Agregar evento al botón de cerrar
    const closeButton = notification.querySelector('.close-notification');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            // Cancelar el timeout si existe
            if (notification.dataset.timeoutId) {
                clearTimeout(parseInt(notification.dataset.timeoutId));
            }
            closeNotification(notification);
        });
    }
};

// Función para cerrar la notificación con animación
function closeNotification(notification) {
    notification.style.opacity = '0';
    // Eliminar del DOM después de completar la transición
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}