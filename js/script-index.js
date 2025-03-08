(function(){

    function sendConsultEmail(){

        // Datos de contacto ingresados en el formulario de contacto
        const phone = document.getElementById('phonee').value.trim();
        const userEmail = document.getElementById('emaill').value.trim();
        const userNames = document.getElementById('namee').value.trim();
        const userMessage = document.getElementById('messagee').value.trim();

        
        const serviceID = 'service_jpxibh8'; // ID del servicio de EmailJS
        const templateID = 'template_4nciwbb'; // ID de la plantilla de EmailJS
        
        // Parámetros para la plantilla de EmailJS (ajusta los nombres según tu plantilla)
        var templateParams = {
            user_phone: phone,
            user_email: userEmail,
            user_names: userNames,
            user_message: userMessage
        };
        

        emailjs.init("k_9nZSnIjBCNH-26v"); // Inicializa EmailJS con tu User ID
        // Envía el correo utilizando EmailJS
        emailjs.send(serviceID, templateID, templateParams).then(
            (response) => {
                console.log('SUCCESS!', response.status, response.text);
            },
            (error) => {
                console.log('FAILED...', error);
            },
        );
    
    }

    const consultForm = document.getElementById('contactForm');
    if(consultForm){
        consultForm.addEventListener('submit', function(e){
            e.preventDefault();
            
            const phone = document.getElementById('phonee').value.trim();
            const email = document.getElementById('emaill').value.trim();
            // Validar formato del teléfono chileno (ejemplo: +56912345678)
            if (!phone.match(/^\+56\d{9,}$/)) {
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