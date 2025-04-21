document.addEventListener("DOMContentLoaded", function () {
    fetch("/html/elements/modal-login.html")
        .then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.text();
        })
        .then(data => {
            document.getElementById("modal-container").innerHTML = data;
            console.log("Modales cargados correctamente");

            document.querySelectorAll(".modal").forEach(modal => new bootstrap.Modal(modal));

            const guestButton = document.getElementById("guest-button");
            if (guestButton) {
                guestButton.addEventListener("click", function () {
                    localStorage.setItem("guestCheckout", "true");
                    const loginModalEl = document.getElementById("modal-login");
                    const loginModal = bootstrap.Modal.getInstance(loginModalEl) || new bootstrap.Modal(loginModalEl);
                    loginModal.hide();
                    window.location.href = "/html/checkout.html";
                });
            }

            setTimeout(() => {
                inicializarLogin();
                register();
            }, 300);
        })
        .catch(error => {
            console.error("Error al cargar los modales:", error);
            document.getElementById("modal-container").innerHTML =
                '<div class="alert alert-danger">Error al cargar los modales. Por favor, recarga la página.</div>';
        });
});

function inicializarLogin() {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const showLoginModal = sessionStorage.getItem("showLoginModal");

    if (showLoginModal === "true" && !loggedInUser) {
        const loginModal = new bootstrap.Modal(document.getElementById("modal-login"));
        loginModal.show();
        sessionStorage.removeItem("showLoginModal");

        const alertDiv = document.createElement("div");
        alertDiv.className = "alert alert-warning alert-dismissible fade show";
        alertDiv.innerHTML = `
            Inicia sesión para realizar tu compra o continúa como invitado.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.getElementById("modal-login").querySelector(".modal-body").prepend(alertDiv);
    }

    if (loggedInUser) {
        const loginSuccessful = document.getElementById("loginSuccessful");

        if (!document.getElementById("userDropdown")) {
            const userDropdown = document.createElement("li");
            userDropdown.classList.add("nav-item", "dropdown");
            userDropdown.id = "userDropdown";
            userDropdown.innerHTML = `
                <a class="nav-link dropdown-toggle text-success" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Hola, ${loggedInUser.nombre}!
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

    const loginForm = document.querySelector("#modal-login form");
    if (loginForm) {
        loginForm.onsubmit = function (event) {
            event.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("password").value.trim();

            fetch("https://creacioneslucero.onrender.com/login", {
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
                        if (sessionStorage.getItem("showLoginModal") === "true") {
                            sessionStorage.removeItem("showLoginModal");
                            window.location.href = "/html/checkout.html";
                            return;
                        }
                        location.reload();
                    }
                })
                .catch(error => console.error("Error al iniciar sesión:", error));
        };
    } else {
        console.error("No se encontró el formulario de login en el documento");
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

        fetch("https://creacioneslucero.onrender.com/usuarios", {
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
                        fetch("https://creacioneslucero.onrender.com/verificar-email", {
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
