// /controllers/orderController.js
const express = require("express");
const transporter = require("../config/mailer");
const router = express.Router();

// Confirmar compra para el cliente
router.post("/confirmacioncompra", async (req, res) => {
    const { userEmail, orderDetails, userNames, userAddress, userCity, userRegion, orderNumber, totalText } = req.body;
    console.log("📦 Confirmación de compra enviada al cliente:", req.body);

    try {
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: userEmail,
            subject: `🛍️ Confirmación de Pedido N°${orderNumber}`,
            html: `
                <h2>¡Hola ${userNames}!</h2>
                <p>Gracias por tu compra en <strong>Creaciones Lucero</strong> 🎉</p>
                <p><strong>Pedido N°:</strong> ${orderNumber}</p>
                <p><strong>Detalles:</strong> ${orderDetails}</p>
                <p><strong>Total:</strong> $${totalText}</p>
                <p><strong>Envío:</strong> ${userAddress}, ${userCity}, Región: ${userRegion}</p>
                <p>¡Esperamos que disfrutes tus productos! 💖</p>
            `
        });

        res.json({ mensaje: "Correo de confirmación enviado al cliente." });
    } catch (error) {
        console.error("❌ Error al enviar confirmación de compra al cliente:", error);
        res.status(500).json({ error: "Error al enviar correo al cliente" });
    }
});

// Confirmar compra para la tienda
router.post("/confirmacioncompratienda", async (req, res) => {
    const { orderDetails, phone, userEmail, userNames, userLastName, userId, userAddress, userOpcional, userCity, userRegion, orderNumber, totalText } = req.body;
    console.log("📦 Nueva orden recibida:", req.body);

    try {
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: "creaciones.lucero.papeleria@gmail.com",
            subject: `📦 Nueva Orden N°${orderNumber}`,
            html: `
                <h2>Nueva Orden Recibida</h2>
                <p><strong>Cliente:</strong> ${userNames} ${userLastName}</p>
                <p><strong>Correo:</strong> ${userEmail}</p>
                <p><strong>Teléfono:</strong> ${phone}</p>
                <p><strong>RUT:</strong> ${userId}</p>
                <p><strong>Dirección:</strong> ${userAddress}, ${userCity}, ${userRegion} (${userOpcional})</p>
                <p><strong>Pedido N°:</strong> ${orderNumber}</p>
                <p><strong>Detalles:</strong> ${orderDetails}</p>
                <p><strong>Total:</strong> $${totalText}</p>
            `
        });

        res.json({ mensaje: "Correo de confirmación enviado a la tienda." });
    } catch (error) {
        console.error("❌ Error al enviar confirmación de compra a la tienda:", error);
        res.status(500).json({ error: "Error al enviar correo a tienda" });
    }
});

module.exports = router;
