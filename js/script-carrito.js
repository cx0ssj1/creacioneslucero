(function() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
    }

    function updateCartBadge() {
        const badge = document.getElementById('cartCount');
        if (badge) {
            const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalQuantity;
        }
    }

    function addItem(item) {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        saveCart();
    }

    function removeCartItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

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
            <button id="checkoutBtn" class="btn btn-success w-100 mt-3">
                Finalizar Compra
            </button>
        `;

        const checkoutBtn = cartFooter.querySelector('#checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function() {
                window.location.href = '/html/checkout.html';
            });
        }
    }

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

    function sendOrderEmail() {
        let orderDetails = "<ul>";
        cart.forEach(item => {
            orderDetails += `<li><strong>${item.name}</strong><br>`;
            orderDetails += `Cantidad: ${item.quantity}<br>`;
            orderDetails += `Precio unitario: $${item.price}</li>`;
        });
        orderDetails += "</ul>";

        const userEmail = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const userNames = document.getElementById('name').value.trim();
        const userLastName = document.getElementById('lastname').value.trim();
        const userId = document.getElementById('rut').value.trim();
        const userAddress = document.getElementById('address').value.trim();
        const userOpcional = document.getElementById('opcional').value.trim();
        const userCity = document.getElementById('city').value.trim();
        const userRegion = document.getElementById('region').value.trim();
        const orderNumber = Math.floor(10000000 + Math.random() * 90000000);
        const totalText = document.getElementById('cartTotal').textContent.replace('Total: $', '');

        if (!userEmail || !phone || !totalText) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        // Enviar correo para tienda
        fetch(`https://creacioneslucero.onrender.com/api/order/confirmacioncompratienda`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderDetails, phone, userEmail, userNames, userLastName, userId, userAddress, userOpcional, userCity, userRegion, orderNumber, totalText })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Confirmación enviada a tienda:", data);
        })
        .catch(error => console.error("Error al enviar a tienda:", error));

        // Enviar correo para cliente
        fetch(`https://creacioneslucero.onrender.com/api/order/confirmacioncompra`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, orderDetails, userNames, userAddress, userCity, userRegion, orderNumber, totalText })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Confirmación enviada al cliente:", data);
            localStorage.removeItem('cart');
            alert('¡Compra realizada con éxito!');
            window.location.href = '/index.html';
        })
        .catch(error => console.error("Error al enviar a cliente:", error));
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendOrderEmail();
        });
    }

    if (document.getElementById('cartItems')) {
        document.addEventListener('DOMContentLoaded', renderCheckout);
    }

    updateCartBadge();
    const offcanvasCart = document.getElementById('offcanvasCart');
    if (offcanvasCart) {
        offcanvasCart.addEventListener('show.bs.offcanvas', renderCart);
    }
})();
