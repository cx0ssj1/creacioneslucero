document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.querySelector(".navbar");

    function updatePadding() {
        const navbarHeight = navbar.offsetHeight;
        document.body.style.paddingTop = navbarHeight + "px";
    }

    // Recalcular padding-top al cargar la página
    updatePadding();

    // Detectar cuando el menú se abre o se cierra en dispositivos móviles
    const navbarToggler = document.querySelector(".navbar-toggler");
    navbarToggler.addEventListener("click", function () {
        setTimeout(updatePadding, 300); // Esperar a que el menú se abra/cierre
    });

    // Ajustar el padding-top al redimensionar la ventana
    window.addEventListener("resize", updatePadding);

    

});