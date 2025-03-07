(function(){

    // Datos de contacto ingresados en el formulario de checkout
    const phone = document.getElementById('phonee').value.trim();
    const userEmail = document.getElementById('emaill').value.trim();
    const userNames = document.getElementById('namee').value.trim();
    const userMessage = document.getElementById('messagee').value.trim();


    const serviceID = 'service_jpxibh8'; // ID del servicio de EmailJS
    const templateID = 'template_rhsawdg'; // ID de la plantilla de EmailJS

    // Parámetros para la plantilla de EmailJS (ajusta los nombres según tu plantilla)
    var templateParams = {
        order_details: orderDetails,
        user_phone: phone,
        user_email: userEmail,
        user_names: userNames,
        user_message: userMessage
    };
    
    // Envía el correo utilizando EmailJS
    emailjs.send(serviceID, templateID, templateParams).then(
        (response) => {
            console.log('SUCCESS!', response.status, response.text);
        },
        (error) => {
            console.log('FAILED...', error);
        },
    );
    
})