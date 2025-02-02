// script-carrito.js
(function() {
    // Variable global para el carrito
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

    // Configuración para productos en stock
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

    // Configuración para productos personalizados
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
            const optionSelector = document.getElementById('optionSelector');
            customization.option = optionSelector ? optionSelector.value : '';
            const anillaSelect = document.getElementById('optionSelector-anilla');
            customization.anilla = anillaSelect ? anillaSelect.value : '';
            if (customization.option === 'color') {
                const colorPicker = document.getElementById('colorPicker');
                customization.color = colorPicker ? colorPicker.value : '';
            }
            const textInput = document.querySelector('input[placeholder="Escribe tu texto aquí"]');
            customization.text = textInput ? textInput.value.trim() : '';
            const hojaSelected = document.querySelector('#customSelect .custom-option.selected');
            if (hojaSelected) {
                customization.hoja = hojaSelected.getAttribute('data-value');
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

    // Función para renderizar el contenido del carrito en el offcanvas
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

    // Función para renderizar el checkout (solo se ejecuta si existe el contenedor #cartItems)
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
                    <td><img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover;"></td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price}</td>
                    <td>$${subtotal}</td>
                </tr>
            `;
        });
        cartItemsContainer.innerHTML = itemsHTML;
        cartTotalEl.textContent = 'Total: $' + total;
    }

    // Si la página es de checkout, renderiza el contenido
    if (document.getElementById('cartItems')) {
        document.addEventListener('DOMContentLoaded', renderCheckout);
    }

    // Exponer funciones si es necesario
    window.Cart = {
        getCart: () => cart,
        addItem: addItem,
        saveCart: saveCart,
        renderCart: renderCart,
        removeCartItem: removeCartItem,
        renderCheckout: renderCheckout
    };
})();
