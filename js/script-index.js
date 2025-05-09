(function(){
    function sendConsultEmail(){
        // Datos de contacto ingresados en el formulario de contacto
        const phone = document.getElementById('phonee').value.trim();
        const userEmail = document.getElementById('emaill').value.trim();
        const userNames = document.getElementById('namee').value.trim();
        const userMessage = document.getElementById('messagee').value.trim();
        
        fetch("https://creacioneslucero.onrender.com/api/contact/consulta", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, userEmail, userNames, userMessage })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    console.log("✅ Consulta enviada:", data);
                }
            })
            .catch(error => console.error("Error al confirmar compra:", error));
    }

    const consultForm = document.getElementById('contactForm');
    if(consultForm){
        consultForm.addEventListener('submit', function(e){
            e.preventDefault();
            
            const phone = document.getElementById('phonee').value.trim();
            const email = document.getElementById('emaill').value.trim();
            // Validar formato del teléfono chileno (ejemplo: +56912345678)
            if (!phone.match(/^(\+?56)?[-\s]?\d{2}[-\s]?\d{3}[-\s]?\d{3,4}$/)) {
                alert('Por favor, ingresa un número telefónico válido que comience con +56 9 o que contenga 9 digitos sin incluir +56 9.');
                return;
            }
            if (!email) {
                alert('Por favor, ingresa un correo electrónico.');
                return;
            }
            const consultaEnviada = true;
            if (consultaEnviada) {
                sendConsultEmail();
                alert('Consulta enviada con éxito');
                consultForm.reset();
            } else {
                alert('Error al enviar la consulta');
            }
        });
    }
})();