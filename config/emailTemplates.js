// URLs y configuración
const LOGO_URL = "https://creacioneslucero.netlify.app/img/logo/logo.png";
const CURRENT_YEAR = new Date().getFullYear();
const STORE_EMAIL = "creaciones.lucero.papeleria@gmail.com";
const STORE_NAME = "Creaciones Lucero";
const WEBSITE_URL = "https://creacioneslucero.netlify.app";
const FACEBOOK_URL = "https://web.facebook.com/karlalucero.salvohernandez";
const INSTAGRAM_URL = "https://www.instagram.com/creaciones_lucero_";

// 1. Email de Verificación de Registro
exports.registrationEmail = (nombre, email, codigoVerificacion) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta - ${STORE_NAME}</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 180px;
                height: auto;
            }
            .container {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h1 {
                color: #8e44ad;
                margin-top: 0;
            }
            .verification-code {
                background-color: #8e44ad;
                color: white;
                font-size: 28px;
                font-weight: bold;
                text-align: center;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
                letter-spacing: 5px;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                text-align: center;
                color: #777;
            }
            .button {
                display: inline-block;
                background-color: #8e44ad;
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${LOGO_URL}" alt="${STORE_NAME}" class="logo">
        </div>
        
        <div class="container">
            <h1>¡Bienvenido/a a ${STORE_NAME}!</h1>
            
            <p>Hola <strong>${nombre}</strong>,</p>
            
            <p>Gracias por registrarte en nuestra tienda en línea. Para garantizar la seguridad de tu cuenta, necesitamos verificar tu dirección de correo electrónico.</p>
            
            <p>Por favor, introduce el siguiente código de verificación:</p>
            
            <div class="verification-code">${codigoVerificacion}</div>
            
            <p>Este código es válido por 24 horas. Si no has solicitado esta verificación, por favor ignora este mensaje.</p>
            
            <p>¡Gracias por confiar en ${STORE_NAME} para tus necesidades de papelería y manualidades!</p>
        </div>
        
        <div class="footer">
            <p>© ${CURRENT_YEAR} ${STORE_NAME} - Todos los derechos reservados</p>
            <p>Este correo fue enviado a ${email}. Si tienes preguntas, contáctanos en ${STORE_EMAIL}</p>
        </div>
    </body>
    </html>
    `;
};

// 2. Email de Verificación Exitosa
exports.verificationSuccessEmail = (email) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Correo Verificado! - ${STORE_NAME}</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 180px;
                height: auto;
            }
            .container {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h1 {
                color: #27ae60;
                margin-top: 0;
            }
            .success-icon {
                text-align: center;
                font-size: 60px;
                margin: 20px 0;
                color: #27ae60;
            }
            .button {
                display: block;
                background-color: #8e44ad;
                color: white;
                text-decoration: none;
                padding: 12px 25px;
                border-radius: 4px;
                font-weight: bold;
                margin: 25px auto;
                text-align: center;
                width: 200px;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                text-align: center;
                color: #777;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${LOGO_URL}" alt="${STORE_NAME}" class="logo">
        </div>
        
        <div class="container">
            <h1>¡Correo verificado exitosamente!</h1>
            
            <div class="success-icon">✓</div>
            
            <p>Hola,</p>
            
            <p>¡Excelente! Tu dirección de correo electrónico ha sido verificada correctamente y tu cuenta está lista para usar.</p>
            
            <p>Ahora puedes disfrutar de todos los beneficios de tu cuenta en ${STORE_NAME}:</p>
            
            <ul>
                <li>Realizar compras de forma rápida y segura</li>
                <li>Seguir el estado de tus pedidos</li>
                <li>Acceder a ofertas exclusivas para clientes</li>
                <li>¡Y mucho más!</li>
            </ul>
            
            <a href="${WEBSITE_URL}/tienda" class="button">Visitar la tienda</a>
            
            <p>¡Esperamos que disfrutes comprando en ${STORE_NAME}!</p>
        </div>
        
        <div class="footer">
            <p>© ${CURRENT_YEAR} ${STORE_NAME} - Todos los derechos reservados</p>
            <p>Si tienes preguntas, contáctanos en ${STORE_EMAIL}</p>
        </div>
    </body>
    </html>
    `;
};

// 3. Email de Solicitud de Restablecimiento de Contraseña
exports.passwordResetEmail = (email, resetCode) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña - ${STORE_NAME}</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 180px;
                height: auto;
            }
            .container {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h1 {
                color: #3498db;
                margin-top: 0;
            }
            .reset-code {
                background-color: #3498db;
                color: white;
                font-size: 28px;
                font-weight: bold;
                text-align: center;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
                letter-spacing: 5px;
            }
            .warning {
                background-color: #fcf8e3;
                border-left: 4px solid #f39c12;
                padding: 12px;
                margin: 20px 0;
                color: #8a6d3b;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                text-align: center;
                color: #777;
            }
            .timer {
                text-align: center;
                font-weight: bold;
                color: #e74c3c;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${LOGO_URL}" alt="${STORE_NAME}" class="logo">
        </div>
        
        <div class="container">
            <h1>Recuperación de Contraseña</h1>
            
            <p>Hola,</p>
            
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en ${STORE_NAME}. Si no has solicitado este cambio, puedes ignorar este correo.</p>
            
            <p>Para continuar con el proceso de recuperación, utiliza el siguiente código:</p>
            
            <div class="reset-code">${resetCode}</div>
            
            <div class="timer">⏱️ Código válido por 10 minutos</div>
            
            <div class="warning">
                <strong>Importante:</strong> Nunca compartas este código con otras personas. El equipo de ${STORE_NAME} nunca te pedirá este código por teléfono o mensajes.
            </div>
            
            <p>Si tienes problemas con la recuperación de tu contraseña, contáctanos respondiendo a este correo.</p>
        </div>
        
        <div class="footer">
            <p>© ${CURRENT_YEAR} ${STORE_NAME} - Todos los derechos reservados</p>
            <p>Este correo fue enviado a ${email}. Si tienes preguntas, contáctanos en ${STORE_EMAIL}</p>
        </div>
    </body>
    </html>
    `;
};

// 4. Email de Consulta de Cliente
exports.contactFormEmail = (userNames, userEmail, phone, userMessage) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Consulta de Cliente - ${STORE_NAME}</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #8e44ad;
                color: white;
                padding: 15px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .container {
                background-color: #f9f9f9;
                border-radius: 0 0 8px 8px;
                padding: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h1 {
                margin-top: 0;
                font-size: 24px;
            }
            .client-info {
                background-color: #eee;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .message-box {
                background-color: white;
                border-left: 4px solid #8e44ad;
                padding: 15px;
                margin-top: 20px;
            }
            .label {
                font-weight: bold;
                color: #555;
                min-width: 100px;
                display: inline-block;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                text-align: center;
                color: #777;
            }
            .actions {
                margin-top: 25px;
                text-align: center;
            }
            .button {
                display: inline-block;
                background-color: #8e44ad;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-weight: bold;
                margin: 0 5px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📩 Nueva Consulta de Cliente</h1>
        </div>
        
        <div class="container">
            <p>Se ha recibido una nueva consulta a través del formulario de contacto:</p>
            
            <div class="client-info">
                <p><span class="label">Nombre:</span> ${userNames}</p>
                <p><span class="label">Correo:</span> <a href="mailto:${userEmail}">${userEmail}</a></p>
                <p><span class="label">Teléfono:</span> <a href="tel:${phone}">${phone}</a></p>
            </div>
            
            <div class="message-box">
                <p><span class="label">Mensaje:</span></p>
                <p style="white-space: pre-line;">${userMessage}</p>
            </div>
            
            <div class="actions">
                <a href="mailto:${userEmail}" class="button">Responder</a>
                <a href="tel:${phone}" class="button">Llamar</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© ${CURRENT_YEAR} ${STORE_NAME} - Panel de Administración</p>
            <p>Este es un mensaje automático, por favor no responder a este correo.</p>
        </div>
    </body>
    </html>
    `;
};

// 5. Email de Confirmación de Pedido al Cliente
exports.orderConfirmationEmail = (userNames, userEmail, orderNumber, orderDetails, totalText, userAddress, userCity, userRegion) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pedido - ${STORE_NAME}</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
            }
            .logo {
                max-width: 180px;
                height: auto;
            }
            .container {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h1 {
                color: #27ae60;
                margin-top: 0;
            }
            .order-number {
                background-color: #27ae60;
                color: white;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                padding: 10px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .order-details {
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
            }
            .order-summary {
                background-color: #f2f2f2;
                border-radius: 5px;
                padding: 15px;
                margin-top: 20px;
            }
            .total {
                font-size: 18px;
                font-weight: bold;
                color: #27ae60;
                margin-top: 10px;
            }
            .shipping-info {
                background-color: #e8f4fc;
                border-left: 4px solid #3498db;
                padding: 15px;
                margin: 20px 0;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                text-align: center;
                color: #777;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
            .social {
                margin-top: 15px;
            }
            .social a {
                display: inline-block;
                margin: 0 10px;
                color: #8e44ad;
            }
            .button {
                display: inline-block;
                background-color: #8e44ad;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 20px;
            }
            .thank-you {
                text-align: center;
                margin: 30px 0 20px;
                font-size: 18px;
                color: #8e44ad;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="${LOGO_URL}" alt="${STORE_NAME}" class="logo">
        </div>
        
        <div class="container">
            <h1>¡Gracias por tu compra!</h1>
            
            <p>Hola <strong>${userNames}</strong>,</p>
            
            <p>¡Hemos recibido tu pedido y lo estamos procesando! A continuación te dejamos los detalles:</p>
            
            <div class="order-number">
                Pedido N° ${orderNumber}
            </div>
            
            <div class="order-details">
                <h2>Productos:</h2>
                <div style="white-space: pre-line;">${orderDetails}</div>
            </div>
            
            <div class="order-summary">
                <h2>Resumen:</h2>
                <div class="total">Total: $${totalText}</div>
            </div>
            
            <div class="shipping-info">
                <h2>Información de envío:</h2>
                <p><strong>Dirección:</strong> ${userAddress}</p>
                <p><strong>Ciudad:</strong> ${userCity}</p>
                <p><strong>Región:</strong> ${userRegion}</p>
                <p><strong>Tiempo estimado de entrega:</strong> 3-5 días hábiles</p>
            </div>
            
            <p>Te enviaremos una notificación cuando tu pedido sea despachado. Si tienes cualquier pregunta, no dudes en contactarnos.</p>
            
            <div class="thank-you">
                <p>¡Gracias por confiar en ${STORE_NAME}! 💖</p>
                <a href="${WEBSITE_URL}/mi-cuenta/mis-pedidos" class="button">Seguir mi pedido</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© ${CURRENT_YEAR} ${STORE_NAME} - Todos los derechos reservados</p>
            <p>Este correo fue enviado a ${userEmail}</p>
            <div class="social">
                <a href="${FACEBOOK_URL}">Facebook</a> | 
                <a href="${INSTAGRAM_URL}">Instagram</a> | 
                <a href="${WEBSITE_URL}">Sitio Web</a>
            </div>
        </div>
    </body>
    </html>
    `;
};

// 6. Email de Notificación de Nueva Orden a la Tienda
exports.newOrderNotificationEmail = (orderNumber, userNames, userLastName, userEmail, phone, userId, userAddress, userCity, userRegion, userOpcional, orderDetails, totalText) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Orden Recibida - Creaciones Lucero</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #8e44ad;
                color: white;
                padding: 15px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .container {
                background-color: #f9f9f9;
                border-radius: 0 0 8px 8px;
                padding: 30px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h1 {
                margin-top: 0;
                font-size: 24px;
            }
            .order-number {
                background-color: #e74c3c;
                color: white;
                font-size: 18px;
                font-weight: bold;
                text-align: center;
                padding: 10px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .section {
                margin-bottom: 25px;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
            }
            .section:last-child {
                border-bottom: none;
            }
            .customer-info {
                background-color: #eee;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }
            .label {
                font-weight: bold;
                color: #555;
                min-width: 120px;
                display: inline-block;
            }
            .products {
                background-color: white;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 15px;
            }
            .total {
                font-size: 18px;
                font-weight: bold;
                color: #e74c3c;
                margin-top: 15px;
                text-align: right;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                text-align: center;
                color: #777;
            }
            .actions {
                margin-top: 25px;
                text-align: center;
            }
            .button {
                display: inline-block;
                background-color: #27ae60;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 4px;
                font-weight: bold;
                margin: 0 5px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📦 Nueva Orden Recibida</h1>
        </div>
        
        <div class="container">
            <div class="order-number">
                Pedido N° ${orderNumber}
            </div>
            
            <div class="section">
                <h2>Información del Cliente</h2>
                <div class="customer-info">
                    <p><span class="label">Nombre:</span> ${userNames} ${userLastName}</p>
                    <p><span class="label">Correo:</span> <a href="mailto:${userEmail}">${userEmail}</a></p>
                    <p><span class="label">Teléfono:</span> <a href="tel:${phone}">${phone}</a></p>
                    <p><span class="label">RUT:</span> ${userId}</p>
                </div>
            </div>
            
            <div class="section">
                <h2>Dirección de Envío</h2>
                <p><span class="label">Dirección:</span> ${userAddress}</p>
                <p><span class="label">Ciudad:</span> ${userCity}</p>
                <p><span class="label">Región:</span> ${userRegion}</p>
                <p><span class="label">Referencias:</span> ${userOpcional}</p>
            </div>
            
            <div class="section">
                <h2>Detalles del Pedido</h2>
                <div class="products">
                    <div style="white-space: pre-line;">${orderDetails}</div>
                    <div class="total">Total: $${totalText}</div>
                </div>
            </div>
            
            <div class="actions">
                <a href="${WEBSITE_URL}/admin/orders/${orderNumber}" class="button">Procesar Pedido</a>
                <a href="mailto:${userEmail}" class="button" style="background-color: #3498db;">Contactar Cliente</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2025 Creaciones Lucero - Panel de Administración</p>
            <p>Este es un mensaje automático del sistema de pedidos.</p>
        </div>
    </body>
    </html>
    `;
};