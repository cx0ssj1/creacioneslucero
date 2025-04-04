fetch("/html/elements/footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-container").innerHTML = data;
        setTimeout(() => {
            inicializarLogin();
        }, 300);
    })
    .catch(error => console.error("Error al cargar el footer:", error));