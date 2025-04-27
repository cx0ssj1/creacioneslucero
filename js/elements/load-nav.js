fetch("/html/elements/navbar.html")
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        document.getElementById("navbar-container").innerHTML = data;
        inicializarLogin(); // Ejecutamos inmediatamente después de cargar el navbar
    })
    .catch(error => {
        console.error("Error al cargar el navbar:", error);
    });
