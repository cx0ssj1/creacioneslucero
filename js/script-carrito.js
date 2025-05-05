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
    // Función para disminuir cantidad de un producto del carrito
    function addItemQuantity(index) {
        const item = cart[index]; // Obtén el elemento del carrito
        item.quantity += 1; // Incrementa la cantidad
        saveCart(); // Guarda el carrito actualizado
        renderCart(); // Vuelve a renderizar el carrito
    }
    // Función para aumentar cantidad de un producto del carrito
    function removeItemQuantity(index) {
        const item = cart[index]; // Obtén el elemento del carrito
        if (item.quantity > 1) {
            item.quantity -= 1; // Decrementa la cantidad si es mayor a 1
        } else {
            cart.splice(index, 1); // Si la cantidad es 1, elimina el elemento del carrito
        }
        saveCart(); // Guarda el carrito actualizado
        renderCart(); // Vuelve a renderizar el carrito
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
        
        // Añadir estilos al carrito
        cartBody.style.padding = "15px";
        cartBody.style.maxHeight = "calc(100vh - 200px)";
        cartBody.style.overflowY = "auto";
        
        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-cart-x" style="font-size: 3rem; color: #ccc;"></i>
                    <p class="mt-3">El carrito está vacío.</p>
                    <button class="btn btn-outline-primary mt-2">Continuar comprando</button>
                </div>
            `;
            cartFooter.innerHTML = '';
            return;
        }
        
        // Título del carrito
        let bodyHtml = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">Tu Carrito (${cart.reduce((sum, item) => sum + item.quantity, 0)} productos)</h5>
            </div>
            <hr>
        `;
        
        let total = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.quantity * item.price;
            total += itemTotal;
            
            // Formato para precios con separador de miles y decimales
            const formattedPrice = item.price.toLocaleString('es-CL', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            const formattedTotal = itemTotal.toLocaleString('es-CL', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            
            bodyHtml += `
                <div class="cart-item mb-3 p-2" style="border-radius: 8px; background-color: #f8f9fa; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div class="d-flex align-items-center">
                        <div class="position-relative" style="width: 80px; height: 80px;">
                            <img src="${item.image}" alt="${item.name}" 
                                style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" 
                                class="me-3">
                        </div>
                        
                        <div class="flex-grow-1 ms-3">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <h6 class="mb-0 fw-bold">${item.name}</h6>
                                <button class="btn btn-sm btn-outline-danger remove-item" data-index="${index}" 
                                    style="padding: 2px 6px; border-radius: 50%;">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                            
                            <div class="d-flex justify-content-between align-items-center mt-2">
                                <div class="quantity-controls d-flex align-items-center" 
                                    style="border: 1px solid #ddd; border-radius: 20px; padding: 2px 8px;">
                                    <button class="btn p-0 me-2" id="removeItemBtn" data-index="${index}">
                                        <i class="bi bi-dash-circle" style="color: #dc3545;"></i>
                                    </button>
                                    <span class="mx-2" style="min-width: 20px; text-align: center;">${item.quantity}</span>
                                    <button class="btn p-0 ms-2" id="addItemBtn" data-index="${index}">
                                        <i class="bi bi-plus-circle" style="color: #28a745;"></i>
                                    </button>
                                </div>
                                
                                <div class="price-info text-end">
                                    <div class="item-price text-muted" style="font-size: 0.8rem;">
                                        $${formattedPrice} c/u
                                    </div>
                                    <div class="item-total fw-bold" style="color: var(--pink-dark);">
                                        $${formattedTotal}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        cartBody.innerHTML = bodyHtml;
        
        // Formatea el total general
        const formattedTotal = total.toLocaleString('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
        
        // Asigna eventos a los botones de agregar y quitar cantidad
        const addButtons = cartBody.querySelectorAll('#addItemBtn');
        addButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                addItemQuantity(index);
            });
        });
        
        const removeButtons = cartBody.querySelectorAll('#removeItemBtn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                removeItemQuantity(index);
            });
        });
    
        // Asigna eventos a los botones de eliminación
        const deleteButtons = cartBody.querySelectorAll('.remove-item');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                removeCartItem(index);
            });
        });
        
        cartFooter.innerHTML = `
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>Subtotal:</span>
                    <span>$${formattedTotal}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="fw-bold">Total:</span>
                    <span class="fw-bold fs-5" style="color: var(--pink-dark);">$${formattedTotal}</span>
                </div>
                
                <button id="checkoutBtn" class="btn w-100 py-2" 
                    style="background-color: var(--pink-dark); border: none; color: white; font-weight: 600; border-radius: 8px;">
                    <i class="bi bi-bag-check me-2"></i>Finalizar Compra
                </button>
                
                <button id="continueShopping" class="btn btn-outline-secondary w-100 mt-2 py-2" style="border-radius: 8px;">
                    <i class="bi bi-arrow-left me-2"></i>Seguir comprando
                </button>
            </div>
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
        
        const continueShoppingBtn = cartFooter.querySelector('#continueShopping');
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', function() {
                const offcanvasElement = document.getElementById('offcanvasCart');
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvas) {
                    offcanvas.hide();
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