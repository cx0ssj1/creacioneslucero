// script-carrito.js
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

    function showCartNotification(item) {
        const notification = document.createElement('div');
        notification.className = 'cart-toast-notification';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: white;
            color: #333;
            border-left: 4px solid #28a745;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            padding: 16px;
            border-radius: 4px;
            z-index: 9999;
            max-width: 300px;
            opacity: 0;
            transition: opacity 0.3s ease-in-out;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="bi bi-check-circle-fill" style="color: #28a745; margin-right: 10px; font-size: 20px;"></i>
                <div>
                    <strong style="display: block; margin-bottom: 3px;">Producto agregado</strong>
                    <span>${item.name}</span>
                    <span>$${item.price}</span>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }, 100);
    }

    function addItem(item) {
        const existingItem = cart.find(
            cartItem => cartItem.id === item.id &&
                        JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
        );
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push(item);
        }
        saveCart();
        showCartNotification(item);
    }

    function removeCartItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

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
                const loggedInToken = localStorage.getItem("token");

                if (!loggedInToken && !localStorage.getItem("guestCheckout")) {
                    sessionStorage.setItem("showLoginModal", "true");
                    const offcanvasElement = document.getElementById('offcanvasCart');
                    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                    if (offcanvas) {
                        offcanvas.hide();
                    }
                    window.location.href = '/index.html';
                } else {
                    window.location.href = '/html/checkout.html';
                }
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
            orderDetails += "<li>";
            if (item.type === 'custom') {
                orderDetails += `<strong>Producto Personalizado:</strong> ${item.name}<br>`;
                orderDetails += `Cantidad: ${item.quantity}<br>`;
                orderDetails += `Precio unitario: $${item.price}<br>`;
            } else {
                orderDetails += `<strong>Producto:</strong> ${item.name}<br>`;
                orderDetails += `Cantidad: ${item.quantity}<br>`;
                orderDetails += `Precio unitario: $${item.price}<br>`;
            }
            orderDetails += "</li>";
        });
        orderDetails += "</ul>";

        // Obtener datos
        let userEmail = document.getElementById('email').value.trim();

        const token = localStorage.getItem('token');
        if (token) {
            const decoded = parseJwt(token);
            userEmail = decoded.email;
        }

        const phone = document.getElementById('phone').value.trim();
        const userNames = document.getElementById('name').value.trim();
        const userLastName = document.getElementById('lastname').value.trim();
        const userId = document.getElementById('rut').value.trim();
        const userAddress = document.getElementById('address').value.trim();
        const userOpcional = document.getElementById('opcional').value.trim();
        const userCity = document.getElementById('city').value.trim();
        const userRegion = document.getElementById('region').value.trim();
        const orderNumber = Math.floor(10000000 + Math.random() * 90000000); // Número de orden aleatorio
        const totalText = document.getElementById('cartTotal').textContent.replace('Total: $', '');

        if (!phone || !userEmail || !totalText) {
            console.log('Error: Faltan datos');
            return;
        }

        fetch("https://creacioneslucero.onrender.com/api/order/confirmacioncompratienda", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderDetails, phone, userEmail, userNames, userLastName, userId, userAddress, userOpcional, userCity, userRegion, orderNumber, totalText })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Orden tienda:", data);
        })
        .catch(error => console.error("Error tienda:", error));

        fetch("https://creacioneslucero.onrender.com/api/order/confirmacioncompra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, orderDetails, userNames, userAddress, userCity, userRegion, orderNumber, totalText })
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Orden cliente:", data);
            localStorage.removeItem('cart');
            alert('Pago exitoso y correo enviado!');
            window.location.href = '/index.html';
        })
        .catch(error => console.error("Error cliente:", error));
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error al decodificar token:", error);
            return {};
        }
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
