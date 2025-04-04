const fs = require("fs").promises;
const path = require("path");

exports.handler = async function(event, context) {
  // Asegurarnos de que el método es POST
if (event.httpMethod !== "POST") {
    return {
    statusCode: 405,
    body: JSON.stringify({ error: "Método no permitido" })
    };
}

    try {
        const { nombre, email, password } = JSON.parse(event.body);
        
        if (!nombre || !email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Todos los campos son obligatorios" })
            };
        }

        // En Netlify Functions no podemos usar fs para escribir en el sistema de archivos
        // En su lugar, podrías usar un servicio como Fauna DB, MongoDB Atlas, etc.
        // Como ejemplo simplificado, simularemos una respuesta exitosa:
        
        return {
            statusCode: 201,
            body: JSON.stringify({ 
                id: Date.now(), 
                nombre, 
                email,
                message: "Usuario registrado exitosamente" 
            })
        };
    
    // Nota: En un entorno real, deberías usar un servicio de base de datos
    // en lugar de archivos JSON para almacenar usuarios
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error al procesar la solicitud" })
        };
    }
};