document.addEventListener("DOMContentLoaded", function () {
    // Agregar la función de notificación al objeto window para usarla globalmente
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
    }

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

    fetch("/html/elements/modal-login.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("modal-container").innerHTML = data;
            inicializarLogin();
            inicializarFormularios(); // << Aquí inicializamos formularios SOLO después de cargar modal
            register();
            vetificarEmail()
        })
        .catch(error => {
            console.error("Error al cargar modales:", error);
            showNotification("Error al cargar los modales. Por favor, recarga la página.", "error");
        });
});

function inicializarLogin() {
    const user = JSON.parse(localStorage.getItem("user"));
    const loginSuccessful = document.getElementById("loginSuccessful");

    if (user && loginSuccessful) {
        // 💥 VERIFICAMOS si ya existe el menú del usuario
        if (!document.getElementById("userDropdown")) {
            const userDropdown = document.createElement("li");
            userDropdown.classList.add("nav-item", "dropdown");
            userDropdown.id = "userDropdown";
            userDropdown.innerHTML = `
                <a class="nav-link dropdown-toggle text-success" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Hola, ${user.nombre}!
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Perfil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="cerrarSesion">Cerrar Sesión</a></li>
                </ul>
            `;
            loginSuccessful.appendChild(userDropdown);

            new bootstrap.Dropdown(userDropdown.querySelector(".dropdown-toggle"));
        }

        document.getElementById("login")?.remove();
        document.getElementById("register")?.remove();
    }
}


function inicializarFormularios() {
    const loginForm = document.getElementById("form-login");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("password").value.trim();

            fetch(`https://creacioneslucero.onrender.com/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showNotification(data.error, "error");
                } else {
                    localStorage.setItem("user", JSON.stringify(data));
                    showNotification("Inicio de sesión exitoso", "success");
                    
                    // Cerrar el modal primero
                    const modal = bootstrap.Modal.getInstance(document.getElementById("modal-login"));
                    if (modal) {
                        modal.hide();
                    }
                    
                    // Recargar después de un breve retraso
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                }
            })
            .catch(error => {
                console.error("Error al iniciar sesión:", error);
                showNotification("Ocurrió un error al iniciar sesión", "error");
            });
        });
    }
    
    // Añadir funcionalidad para continuar como invitado
    const guestButton = document.getElementById("guest-button");
    if (guestButton) {
        guestButton.addEventListener("click", function() {
            // Crear un usuario invitado temporal
            const guestUser = {
                nombre: "Invitado",
                email: "invitado_" + Date.now() + "@guest.com",
                id: "guest_" + Date.now()
            };
            
            // Guardar en localStorage
            localStorage.setItem("user", JSON.stringify(guestUser));
            
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("modal-login"));
            if (modal) {
                modal.hide();
            }
            
            showNotification("Continuando como invitado", "info");
            
            // Redirigir al checkout si estaba en proceso
            if (sessionStorage.getItem("showLoginModal") === "true") {
                sessionStorage.removeItem("showLoginModal");
                setTimeout(() => {
                    window.location.href = '/html/checkout.html';
                }, 1000);
            } else {
                // Solo recargar la página
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        });
    }
}

function cerrarSesion() {
    localStorage.removeItem("user");
    showNotification("Has cerrado sesión correctamente", "info");
    setTimeout(() => {
        location.reload();
    }, 1000);
}

document.addEventListener("click", function (event) {
    if (event.target.id === "cerrarSesion") {
        event.preventDefault();
        cerrarSesion();
    }
});

function vetificarEmail() {
    const btnVerificarHelp = document.querySelector("#form-verificacion-help");
    btnVerificarHelp.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("register-emaill").value.trim();
        const codigo = document.getElementById("codigo-verificacionn").value.trim();
        fetch(`https://creacioneslucero.onrender.com/api/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, codigo })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, "error");
            } else {
                showNotification("Correo verificado correctamente. ¡Ya puedes iniciar sesión!", "success");
            }
        })
        .catch(err => {
            console.error("Error al verificar correo:", err);
            showNotification("Ocurrió un error al verificar tu código", "error");
        });
    });
}

function register() {
    const registerForm = document.querySelector("#form-registro");
    if (!registerForm) return;

    const pasoRegistro = document.getElementById("registro-usuario");
    const pasoVerificacion = document.getElementById("form-verificacion");
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("register-name").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (password !== confirmPassword) {
            showNotification("Las contraseñas no coinciden", "error");
            return;
        }

        fetch(`https://creacioneslucero.onrender.com/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, "error");
            } else {
                showNotification("Registro exitoso. Revisa tu correo para ingresar el código", "success");
                pasoRegistro.classList.add("d-none");
                pasoVerificacion.classList.remove("d-none");

                ["register-name", "register-email", "register-password", "confirm-password"].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.required = false;
                });

                sessionStorage.setItem("verificacionEmail", email);

                const btnVerificar = document.getElementById("btn-verificar-codigo");
                if (btnVerificar) {
                    btnVerificar.addEventListener("click", function () {
                        const codigo = document.getElementById("codigo-verificacion").value.trim();
                        fetch(`https://creacioneslucero.onrender.com/api/auth/verify-email`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email, codigo })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.error) {
                                showNotification(data.error, "error");
                            } else {
                                showNotification("Correo verificado correctamente. ¡Ya puedes iniciar sesión!", "success");
                                sessionStorage.removeItem("verificacionEmail");
                                
                                // Cerrar el modal después de un breve retraso
                                setTimeout(() => {
                                    const modal = bootstrap.Modal.getInstance(document.getElementById("modal-registro"));
                                    if (modal) modal.hide();
                                }, 1500);
                            }
                        })
                        .catch(err => {
                            console.error("Error al verificar correo:", err);
                            showNotification("Ocurrió un error al verificar tu código", "error");
                        });
                    });
                }
            }
        })
        .catch(error => {
            console.error("Error al registrar usuario:", error);
            showNotification("Ocurrió un error durante el registro", "error");
        });
    });
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    button.innerText = isVisible ? "👁" : "🙈";
}