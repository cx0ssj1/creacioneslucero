// /js/script-login.js

document.addEventListener("DOMContentLoaded", function () {
    fetch("/html/elements/modal-login.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("modal-container").innerHTML = data;
            inicializarLogin();
            inicializarFormularios(); // << Aquí inicializamos formularios SOLO después de cargar modal
            register();
        })
        .catch(error => console.error("Error al cargar modales:", error));
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
                    alert(data.error);
                } else {
                    localStorage.setItem("user", JSON.stringify(data));
                    alert("Inicio de sesión exitoso.");
                    location.reload();
                }
            })
            .catch(error => {
                console.error("Error al iniciar sesión:", error);
                alert("Ocurrió un error al iniciar sesión.");
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
            
            // Redirigir al checkout si estaba en proceso
            if (sessionStorage.getItem("showLoginModal") === "true") {
                sessionStorage.removeItem("showLoginModal");
                window.location.href = '/html/checkout.html';
            } else {
                // Solo recargar la página
                location.reload();
            }
        });
    }
}

function cerrarSesion() {
    localStorage.removeItem("user");
    location.reload();
}

document.addEventListener("click", function (event) {
    if (event.target.id === "cerrarSesion") {
        event.preventDefault();
        cerrarSesion();
    }
});

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
            alert("Las contraseñas no coinciden.");
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
                alert(data.error);
            } else {
                alert("Registro exitoso. Revisa tu correo para ingresar el código.");
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
                                alert(data.error);
                            } else {
                                alert("Correo verificado correctamente. ¡Ya puedes iniciar sesión!");
                                sessionStorage.removeItem("verificacionEmail");
                                const modal = bootstrap.Modal.getInstance(document.getElementById("modal-registro"));
                                modal.hide();
                            }
                        })
                        .catch(err => {
                            console.error("Error al verificar correo:", err);
                            alert("Ocurrió un error al verificar tu código.");
                        });
                    });
                }
            }
        })
        .catch(error => console.error("Error al registrar usuario:", error));
    });
}

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const isVisible = input.type === "text";
    input.type = isVisible ? "password" : "text";
    button.innerText = isVisible ? "👁" : "🙈";
}