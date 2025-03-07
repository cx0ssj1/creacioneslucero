// script-carrito.js
(function() {
    // Variable global para el carrito (se guarda en localStorage)
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Función para guardar el carrito en localStorage y actualizar el badge
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }

    // Actualiza el contador del carrito (suma las cantidades de todos los productos)
    function updateCartBadge() {
        const badge = document.getElementById('cartCount');
        if (badge) {
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalQuantity;
        }
    }

    // Función para agregar un producto al carrito
    function addItem(item) {
        const existingItem = cart.find(
            cartItem =>
                cartItem.id === item.id &&
                JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
        );
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        saveCart();
    }

    // ----------------------------
    // Configuración para productos en stock
    // ----------------------------
    document.querySelectorAll('.card button.btn-primary').forEach(button => {
        button.addEventListener('click', function() {
            const card = button.closest('.card');
            if (!card) return;
            const id = card.getAttribute('data-id') || card.querySelector('.card-title').textContent.trim();
            const name = card.querySelector('.card-title').textContent.trim();
            const priceText = card.querySelector('.price').textContent.trim();
            const price = parseFloat(priceText.replace('$', '').replace(/\./g, ''));
            const image = card.querySelector('img').src;
            const item = {
                id: id,
                name: name,
                price: price,
                image: image,
                type: 'stock',
                quantity: 1,
                customization: {}
            };
            addItem(item);
        });
    });

    // ----------------------------
    // Configuración para productos personalizados
    // ----------------------------
    const customAddBtn = document.querySelector('main button.btn-primary.btn-lg');
    if (customAddBtn) {
        customAddBtn.addEventListener('click', function() {
            const id = 'custom-libreta';
            const name = document.querySelector('h1').textContent.trim();
            const priceText = document.querySelector('.mt-2 span.h2').textContent.trim();
            const price = parseFloat(priceText.replace('$', '').replace(/\./g, ''));
            const image = document.querySelector('#productCarousel .carousel-item.active img').src;
            const quantityInput = document.getElementById('quantity');
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            
            const customization = {};

            // Obtener texto personalizado
            const textInput = document.querySelector('input[placeholder="Escribe tu texto aquí"]');
            customization.text = textInput ? textInput.value.trim() : '';

            // Obtener el tipo de tapa seleccionado
            const optionSelector = document.getElementById('optionSelector');
            customization.option = optionSelector ? optionSelector.value : '';

            // Si se selecciona opción de color, obtener el color elegido
            if (customization.option === 'color') {
                const colorPicker = document.getElementById('colorPicker');
                customization.color = colorPicker ? colorPicker.value : '';
            }

            // Obtener el tipo de hoja
            const tipoHoja = document.getElementById('tipoHoja');
            if (tipoHoja) {
                customization.tipoHoja = tipoHoja.value;
            }

            // Obtener el tipo de anilla (para libretas, por ejemplo)
            const anillaSelect = document.getElementById('optionSelector-anilla');
            if (anillaSelect) {
                customization.anilla = anillaSelect.value;
            }

            const item = {
                id: id,
                name: name,
                price: price,
                image: image,
                type: 'custom',
                quantity: quantity,
                customization: customization
            };
            addItem(item);
        });
    }

    // ----------------------------
    // Función para renderizar el contenido del carrito en el offcanvas
    // ----------------------------
    function renderCart() {
        const cartBody = document.querySelector('#offcanvasCart .offcanvas-body');
        const cartFooter = document.getElementById('offcanvasCartFooter');
        if (!cartBody || !cartFooter) return;
        if (cart.length === 0) {
            cartBody.innerHTML = '<p>El carrito está vacío.</p>';
            cartFooter.innerHTML = '';
            return;
        }
        let bodyHtml = '';
        let total = 0;
        cart.forEach((item, index) => {
            total += item.quantity * item.price;
            bodyHtml += `
                <div class="cart-item d-flex align-items-center mb-3">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <small>${item.quantity} x $${item.price}</small>
                    </div>
                    <button class="btn btn-sm btn-danger remove-item" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
        });
        cartBody.innerHTML = bodyHtml;
        // Asigna eventos a los botones de eliminación
        const removeButtons = cartBody.querySelectorAll('.remove-item');
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                removeCartItem(index);
            });
        });
        cartFooter.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Total: $${total}</h5>
            </div>
            <button id="checkoutBtn" class="btn btn-success w-100 mt-3" style="background-color: var(--pink-dark); border: none; font-size: 1.1rem;">
                Finalizar Compra
            </button>
        `;
        const checkoutBtn = cartFooter.querySelector('#checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                // Redirige a la página de checkout
                window.location.href = '/html/checkout.html';
            });
        }
    }

    // Función para eliminar un producto del carrito
    function removeCartItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

    updateCartBadge();
    const offcanvasCart = document.getElementById('offcanvasCart');
    if (offcanvasCart) {
        offcanvasCart.addEventListener('show.bs.offcanvas', renderCart);
    }

    // ----------------------------
    // Función para renderizar el checkout (en la página checkout.html)
    // ----------------------------
    function renderCheckout() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalEl = document.getElementById('cartTotal');
        if (!cartItemsContainer || !cartTotalEl) return;
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length === 0) {
            cartItemsContainer.innerHTML = `<tr><td colspan="5" class="text-center">Tu carrito está vacío.</td></tr>`;
            cartTotalEl.textContent = 'Total: $0';
            return;
        }
        let itemsHTML = '';
        let total = 0;
        localCart.forEach(item => {
            const subtotal = item.quantity * item.price;
            total += subtotal;
            itemsHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price}</td>
                    <td>$${subtotal}</td>
                </tr>
            `;
        });
        cartItemsContainer.innerHTML = itemsHTML;
        cartTotalEl.innerHTML = 'Total: $' + total;
    }

    // Si la página es de checkout, se ejecuta renderCheckout()
    if (document.getElementById('cartItems')) {
        document.addEventListener('DOMContentLoaded', renderCheckout);
    }

    // ----------------------------
    // Función para generar un número de pedido único (8 a 10 dígitos)
    // ----------------------------
    function generateUniqueOrderNumber() {
        // Obtenemos los números de pedido ya generados (si existen)
        let orderNumbers = JSON.parse(localStorage.getItem('orderNumbers')) || [];
        let newNumber;
        do {
            // Elegir aleatoriamente una longitud entre 8 y 10 dígitos
            const length = Math.floor(Math.random() * 3) + 8; // 8, 9 o 10 dígitos
            const min = Math.pow(10, length - 1);
            const max = Math.pow(10, length) - 1;
            newNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (orderNumbers.includes(newNumber));
        // Guardamos el nuevo número para evitar duplicados en futuras órdenes
        orderNumbers.push(newNumber);
        localStorage.setItem('orderNumbers', JSON.stringify(orderNumbers));
        return newNumber;
    }

    // ----------------------------
    // Función para enviar la orden por correo (ejemplo con EmailJS)
    // ----------------------------
    function sendOrderEmail() {
        let orderDetails = "";
        cart.forEach(item => {
            if (item.type === 'custom') {
                orderDetails += `Producto Personalizado: ${item.name}\n`;
                orderDetails += `Cantidad: ${item.quantity}\n`;
                orderDetails += `Precio unitario: $${item.price}\n\n`;
                orderDetails += "Detalles de Personalización:\n";
                
                if (item.customization.text) {
                    orderDetails += `- Texto personalizado: ${item.customization.text}\n`;
                }
                
                if (item.customization.tipoHoja) {
                    orderDetails += `- Tipo de hoja: ${item.customization.tipoHoja}\n`;
                }
                
                if (item.customization.option === 'color') {
                    orderDetails += `- Tapa: Color sólido (${item.customization.color})\n`;
                } else if (item.customization.option === 'personalizada') {
                    orderDetails += `- Tapa: Personalizada\n`;
                }
                
                if (item.customization.anilla) {
                    orderDetails += `- Tipo de anilla: ${item.customization.anilla}\n`;
                }
                
                orderDetails += "\n";
            } else {
                orderDetails += `Producto: ${item.name}\n`;
                orderDetails += `Cantidad: ${item.quantity}\n`;
                orderDetails += `Precio unitario: $${item.price}\n\n`;
            }
        });
        
        // Datos de contacto ingresados en el formulario de checkout
        const phone = document.getElementById('phone').value.trim();
        const userEmail = document.getElementById('email').value.trim();
        const userNames = document.getElementById('name').value.trim();
        const userLastName = document.getElementById('lastname').value.trim();
        const userId = document.getElementById('rut').value.trim();
        const userAddress = document.getElementById('address').value.trim();
        const userOpcional = document.getElementById('opcional').value.trim();
        const userCity = document.getElementById('city').value.trim();
        const userRegion = document.getElementById('region').value.trim();
        const orderNumber = generateUniqueOrderNumber();
        const totalText = document.getElementById('cartTotal').textContent.replace(/Total:\s*\$/, '').trim();

        // Verifica que los elementos del formulario existen y tienen valores
        if (!phone || !userEmail || !totalText) {
            console.log('Error: Faltan datos de contacto o total del carrito.');
            return;
        }

        // Generamos el número de pedido único

        // Parámetros para la plantilla de EmailJS (ajusta los nombres según tu plantilla)
        var templateParams = {
            order_details: orderDetails,
            user_phone: phone,
            user_email: userEmail,
            user_names: userNames,
            user_lastName: userLastName,
            user_id: userId,
            user_address: userAddress,
            user_opcional: userOpcional,
            user_city: userCity,
            user_region: userRegion,
            order_number: orderNumber,
            order_total: totalText
        };

        const serviceID = 'service_f1qem3k'; // ID del servicio de EmailJS
        const templateID = 'template_kep2c6o'; // ID de la plantilla de EmailJS

        // Envía el correo utilizando EmailJS
        emailjs.send(serviceID, templateID, templateParams).then(
            (response) => {
                console.log('SUCCESS!', response.status, response.text);
            },
            (error) => {
                console.log('FAILED...', error);
            },
        );
        // Enviar al cliente con el mismo contenido
        var clientParams = { ...templateParams, to_email: userEmail };
        emailjs.send(serviceID, "template_g6xbnma", clientParams).then(
            (response) => {
                console.log("Correo enviado al cliente", response);
            },
            (error) => {
                console.error("Error enviando al cliente", error);
            },
        );
    }

    // ----------------------------
    // Manejo del formulario de checkout
    // Se ejecuta solo en la página de checkout (si existe #checkoutForm)
    // ----------------------------
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            // Validar formato del teléfono chileno (ejemplo: +56912345678)
            if (!phone.match(/^\+56\d{9,}$/)) {
                alert('Por favor, ingresa un número telefónico válido que comience con +56.');
                return;
            }
            if (!email) {
                alert('Por favor, ingresa un correo electrónico.');
                return;
            }
            // Simulación de confirmación de pago. Reemplaza esta lógica con la de tu pasarela real.
            const pagoExitoso = true;
            if (pagoExitoso) {
                // Envía el correo con la orden solo si el pago es exitoso.
                sendOrderEmail();
                // Opcional: limpiar el carrito y redirigir a una página de confirmación.
                localStorage.removeItem('cart');
                alert('Pago exitoso y correo enviado!');
            }
        });
    }

    // Exponer funciones si es necesario
    window.Cart = {
        getCart: () => cart,
        addItem: addItem,
        saveCart: saveCart,
        renderCart: renderCart,
        removeCartItem: removeCartItem,
        renderCheckout: renderCheckout,
        sendOrderEmail: sendOrderEmail
    };

})();
