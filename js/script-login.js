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
                recuperarContrasena(); // <-- NUEVO
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
    const registerForm = document.querySelector("#modal-registro form");
    if (registerForm) {
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
                        alert("Registro exitoso. Ahora puedes iniciar sesión.");
                        document.querySelector("#modal-registro .btn-close").click();
                    }
                })
                .catch(error => console.error("Error al registrar usuario:", error));
        });
    }
}

function recuperarContrasena() {
    const paso1 = document.getElementById("paso1");
    const paso2 = document.getElementById("paso2");

    const btnEnviarCodigo = document.getElementById("enviar-codigo");
    const btnConfirmar = document.getElementById("confirm-reset");

    const spinnerEnviar = document.getElementById("spinner-enviar");
    const spinnerReset = document.getElementById("spinner-reset");

    if (!btnEnviarCodigo || !btnConfirmar) return;

    btnEnviarCodigo.addEventListener("click", function () {
        const email = document.getElementById("reset-email").value.trim();
        if (!email) return alert("Ingresa tu correo electrónico.");

        spinnerEnviar.classList.remove("d-none");
        btnEnviarCodigo.disabled = true;

        fetch("https://creacioneslucero.onrender.com/solicitar-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert("Código enviado. Revisa tu correo.");
                paso1.classList.add("d-none");
                paso2.classList.remove("d-none");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error al enviar el código");
        })
        .finally(() => {
            spinnerEnviar.classList.add("d-none");
            btnEnviarCodigo.disabled = false;
        });
    });

    btnConfirmar.addEventListener("click", function () {
        const email = document.getElementById("reset-email").value.trim();
        const code = document.getElementById("reset-code").value.trim();
        const nuevaPassword = document.getElementById("reset-password").value.trim();

        spinnerReset.classList.remove("d-none");
        btnConfirmar.disabled = true;

        fetch("https://creacioneslucero.onrender.com/confirmar-reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code, nuevaPassword })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert("Contraseña actualizada. Ya puedes iniciar sesión.");
                location.reload();
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error al restablecer contraseña.");
        })
        .finally(() => {
            spinnerReset.classList.add("d-none");
            btnConfirmar.disabled = false;
        });
    });
}
