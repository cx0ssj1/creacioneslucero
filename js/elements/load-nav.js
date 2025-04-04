fetch("/html/elements/navbar.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("navbar-container").innerHTML = data;
        setTimeout(() => {
            inicializarLogin();
        }, 300);
    })
    .catch(error => console.error("Error al cargar el navbar:", error));