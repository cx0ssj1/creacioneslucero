fetch("/html/elements/footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-container").innerHTML = data;
        setTimeout(() => {
            inicializarLogin();
        }, 300);
    })
    .catch(error => console.error("Error al cargar el footer:", error));

    fetch("/html/elements/navbar.html")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        document.getElementById("navbar-container").innerHTML = data;
        inicializarLogin(); // Llamamos a inicializarLogin() inmediatamente después de insertar el navbar
    })
    .catch(error => {
        console.error("Error al cargar el navbar:", error);
    });
