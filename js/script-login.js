document.addEventListener("DOMContentLoaded", function () {
    // Carga los modales de login/registro
    fetch("/html/elements/modal-login.html")
        .then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.text();
        })
        .then(data => {
            document.getElementById("modal-container").innerHTML = data;
            console.log("Modales cargados correctamente");
            
            // Asigna el evento al botón de "Continuar como invitado" ya que ahora existe en el DOM
            const guestButton = document.getElementById("guest-button");
            if (guestButton) {
                guestButton.addEventListener("click", function () {
                    // Configuramos el flag para continuar sin usuario registrado
                    localStorage.setItem("guestCheckout", "true");
                    // Cerramos el modal de login
                    const loginModalEl = document.getElementById("modal-login");
                    // Usamos o creamos la instancia de Bootstrap Modal
                    const loginModal = bootstrap.Modal.getInstance(loginModalEl) || new bootstrap.Modal(loginModalEl);
                    loginModal.hide();
                    // Redirigimos a la página de checkout
                    window.location.href = "/html/checkout.html";
                });
            }
            
            // Inicializa los modales de Bootstrap después de cargarlos
            document.querySelectorAll(".modal").forEach(modal => new bootstrap.Modal(modal));
            
            // Inicializar login y registro después de un breve retraso
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


// Función para inicializar el login

function inicializarLogin() {
    // Verificar si el usuario está logueado
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    
    // Verificar si viene de un intento de acceder a checkout sin estar logueado
    const showLoginModal = sessionStorage.getItem("showLoginModal");
    if (showLoginModal === "true" && !loggedInUser) {
        // Abrir el modal de login automáticamente
        const loginModal = new bootstrap.Modal(document.getElementById("modal-login"));
        loginModal.show();
        
        // Limpiar la bandera para evitar que se abra en futuras recargas
        sessionStorage.removeItem("showLoginModal");
        
        // Mostrar mensaje de que necesita iniciar sesión
        const alertDiv = document.createElement("div");
        alertDiv.className = "alert alert-warning alert-dismissible fade show";
        alertDiv.innerHTML = `
            inicia sesión para realizar tu compra o continua como invitado.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.getElementById("modal-login").querySelector(".modal-body").prepend(alertDiv);
    }

    if (loggedInUser) {
        // Obtener el elemento donde se insertará el dropdown
        const loginSuccessful = document.getElementById("loginSuccessful");

        // Verificar si ya existe el dropdown para no duplicarlo
        if (!document.getElementById("userDropdown")) {
            const userDropdown = document.createElement("li");
            userDropdown.classList.add("nav-item", "dropdown");
            userDropdown.id = "userDropdown"; // ID para evitar duplicados
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

            // Inicializar el dropdown de Bootstrap
            new bootstrap.Dropdown(userDropdown.querySelector(".dropdown-toggle"));
        }
        
        // Ocultar botones de login y registro
        document.getElementById("login")?.remove();
        document.getElementById("register")?.remove();
    }

    // Manejar el formulario de login (código existente)
    const loginForm = document.querySelector("#modal-login form");
    if (loginForm) {
        // Asignar directamente
        loginForm.onsubmit = function(event) {
            event.preventDefault();
            // Código de manejo del login (igual al que pusimos en handleLoginSubmit)
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("password").value.trim();

            fetch("/usuarios.json")
                .then(response => {
                    if (!response.ok) throw new Error("No se pudo cargar el JSON");
                    return response.json();
                })
                .then(data => {
                    const userFound = data.usuarios.find(user => user.email === email && user.password === password);

                    if (userFound) {
                        localStorage.setItem("user", JSON.stringify(userFound));
                        if (sessionStorage.getItem("showLoginModal") === "true") {
                            sessionStorage.removeItem("showLoginModal");
                            window.location.href = "/html/checkout.html";
                            return;
                        }
                        location.reload();
                    } else {
                        alert("Correo o contraseña incorrectos, intente de nuevo");
                    }
                })
                .catch(error => console.error("Error al cargar el JSON:", error));
        }
    } else {
        console.error("No se encontró el formulario de login en el documento");
    }
}

// Función para cerrar sesión
function cerrarSesion() {
    localStorage.removeItem("user");
    location.reload();
}

// Manejar evento de cierre de sesión
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

            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            // Enviar datos al backend
            fetch("http://localhost:3000/usuarios", {
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
                    document.querySelector("#modal-registro .btn-close").click(); // Cierra el modal
                }
            })
            .catch(error => console.error("Error al registrar usuario:", error));
        });
    }
}
