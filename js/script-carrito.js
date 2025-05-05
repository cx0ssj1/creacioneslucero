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

    // Función para mostrar notificación al agregar al carrito (aparece sobre la pantalla)
    function showCartNotification(item) {
        // Usar la función global de notificación
        window.showNotification(`
            <strong style="display: block; margin-bottom: 3px;">Producto agregado</strong>
            <span>${item.name}</span>
            <span>$${item.price}</span>
        `, 'success', 3000);
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
        showCartNotification(item);
    }

    // Función para eliminar un producto del carrito
    function removeCartItem(index) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

    function addItemQuantity(index) {
        if (cart[index]) {
            cart[index].quantity += 1;
            saveCart();
            renderCart();
        }
    }
    function removeItemQuantity(index) {
        if (cart[index] && cart[index].quantity > 1) {
            cart[index].quantity -= 1;
            saveCart();
            renderCart();
        }
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
                <div class="cart-item d-flex align-items-center mb-3" style="border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;" class="me-2">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <button class="btn btn-primary" id="removeItemBtn" data-index="${index}">
                            <i class="bi bi-dash me-2"></i>
                        </button>
                        <small>${item.quantity}</small>
                        <button class="btn btn-primary" id="addItemBtn" data-index="${index}">
                            <i class="bi bi-plus me-2"></i>
                        </button>
                        <small>$${total}</small>
                    </div>
                    <button class="btn btn-sm btn-danger remove-item" data-index="${index}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
        });
        cartBody.innerHTML = bodyHtml;
        
        // Asigna eventos a los botones de agregar y quitar cantidad
        const addButton = cartBody.querySelectorAll('#addItemBtn');
        addButton.forEach(button => {
            button.addEventListener('click', function(e) {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                addItemQuantity(index);
            });
        });
        const downerButton = cartBody.querySelectorAll('#removeItemBtn');
        downerButton.forEach(button => {
            button.addEventListener('click', function(e) {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                removeItemQuantity(index);
            });
        });

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
                // Verificar si hay un usuario logueado
                const loggedInUser = JSON.parse(localStorage.getItem("user"));
                
                if (!loggedInUser) {
                    // Si no hay usuario logueado, guardar flag para mostrar el modal
                    sessionStorage.setItem("showLoginModal", "true");
                    // Cerrar el offcanvas del carrito
                    const offcanvasElement = document.getElementById('offcanvasCart');
                    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                    if (offcanvas) {
                        offcanvas.hide();
                    }
                    // Si estamos en checkout.html, redirigir a la página principal
                    if (window.location.href.includes('checkout.html')) {
                        window.location.href = '/index.html';
                    } else {
                        // Mostrar el modal de login
                        const loginModal = new bootstrap.Modal(document.getElementById("modal-login"));
                        loginModal.show();
                        
                        // Mostrar mensaje en el modal
                        const alertDiv = document.createElement("div");
                        alertDiv.className = "alert alert-warning alert-dismissible fade show";
                        alertDiv.innerHTML = `
                            Es necesario iniciar sesión para realizar el checkout.
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        `;
                        document.getElementById("modal-login").querySelector(".modal-body").prepend(alertDiv);
                    }
                } else {
                    // Si hay usuario logueado, redirigir a la página de checkout
                    window.location.href = '/html/checkout.html';
                }
            });
        }
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
    // Función para enviar la orden por correo
    // ----------------------------
    function sendOrderEmail() {
        let orderDetails = "<ul>";
    
        cart.forEach(item => {
            orderDetails += "<li>";
            orderDetails += `<strong>Producto:</strong> ${item.name}<br>`;
            orderDetails += `Cantidad: ${item.quantity}<br>`;
            orderDetails += `Precio unitario: $${item.price}<br>`;
            orderDetails += "</li>";
        });
        
        orderDetails += "</ul>";
        
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
        
        // Enviar la orden a la tienda (actualizado para la nueva estructura de rutas)
        fetch("https://creacioneslucero.onrender.com/api/order/confirmacioncompratienda", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderDetails, phone, userEmail, userNames, userLastName, userId, userAddress, userOpcional, userCity, userRegion, orderNumber, totalText })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    window.showNotification(data.error, "error");
                } else {
                    console.log("✅ Orden confirmada:", data);
                }
            })
            .catch(error => console.error("Error al confirmar compra:", error));

        // Enviar al cliente con el mismo contenido (actualizado para la nueva estructura de rutas)
        fetch("https://creacioneslucero.onrender.com/api/order/confirmacioncompra", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userEmail, orderDetails, userNames, userAddress, userCity, userRegion, orderNumber, totalText })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    window.showNotification(data.error, "error");
                } else {
                    console.log("✅ Orden confirmada:", data);
                    window.showNotification("¡Orden confirmada! Gracias por tu compra.", "success");
                    setTimeout(() => {
                        window.location.href = '/index.html'; // Redirigir a la página principal
                    }, 2000);
                }
            })
            .catch(error => console.error("Error al confirmar compra:", error));
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
                window.showNotification('Por favor, ingresa un número telefónico válido que comience con +56 9 o que contenga 9 digitos sin incluir +56 9.', 'warning');
                return;
            }
            if (!email) {
                window.showNotification('Por favor, ingresa un correo electrónico.', 'warning');
                return;
            }
            // Simulación de confirmación de pago. Reemplaza esta lógica con la de tu pasarela real.
            const pagoExitoso = true;
            if (pagoExitoso) {
                sendOrderEmail();
                
                const usuario = JSON.parse(localStorage.getItem("user"));
                if (usuario) {
                    // Actualizado para la nueva ruta
                    fetch("https://creacioneslucero.onrender.com/api/auth/sumar-venta", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: usuario.email })
                    })
                    .then(res => res.json())
                    .then(data => console.log("✅ Venta registrada:", data))
                    .catch(err => console.error("❌ Error al registrar venta:", err));
                }
            
                // Y finalmente, en el mismo checkoutForm:
                localStorage.removeItem('cart');
                window.showNotification('Pago exitoso y correo enviado!', 'success');
                setTimeout(() => {
                    window.location.href = '/index.html'; // Redirigir a la página principal
                }, 2000);
            }            
        });
    }

    // Inicializar select de regiones y comunas en la página de checkout
    if (document.getElementById('region')) {
        document.addEventListener("DOMContentLoaded", function () {
            const regionSelect = document.getElementById("region");
            const comunaSelect = document.getElementById("city");

            // Cargar JSON dinámicamente
            fetch("/comunas-regiones.json")
                .then(response => response.json())
                .then(data => {
                    // Llenar el select de regiones
                    data.regiones.forEach(regionObj => {
                        let option = document.createElement("option");
                        option.value = regionObj.region;
                        option.textContent = regionObj.region;
                        regionSelect.appendChild(option);
                    });

                    // Evento para actualizar comunas cuando cambia la región
                    regionSelect.addEventListener("change", function () {
                        let regionSeleccionada = this.value;

                        // Limpiar opciones previas de comuna
                        comunaSelect.innerHTML = '<option value="" selected disabled>Seleccione una comuna</option>';

                        // Buscar las comunas correspondientes y agregarlas al select
                        let regionEncontrada = data.regiones.find(r => r.region === regionSeleccionada);
                        if (regionEncontrada) {
                            regionEncontrada.comunas.forEach(comuna => {
                                let option = document.createElement("option");
                                option.value = comuna;
                                option.textContent = comuna;
                                comunaSelect.appendChild(option);
                            });
                        }
                    });
                })
                .catch(error => console.error("Error cargando el JSON:", error));
        });
    }

    // Inicializar el offcanvas del carrito
    updateCartBadge();
    const offcanvasCart = document.getElementById('offcanvasCart');
    if (offcanvasCart) {
        offcanvasCart.addEventListener('show.bs.offcanvas', renderCart);
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