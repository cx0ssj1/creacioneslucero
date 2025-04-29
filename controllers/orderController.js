const express = require("express");
const transporter = require("../config/mailer");
const templates = require("../config/emailTemplates");
const router = express.Router();

// Confirmar compra para el cliente
router.post("/confirmacioncompra", async (req, res) => {
    const { userEmail, orderDetails, userNames, userAddress, userCity, userRegion, orderNumber, totalText } = req.body;
    console.log("📦 Confirmación de compra enviada al cliente:", req.body);

    try {
        const html = templates.orderConfirmationEmail(userNames, userEmail, orderNumber, orderDetails, totalText, userAddress, userCity, userRegion);
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: userEmail,
            subject: `🛍️ Confirmación de Pedido N°${orderNumber}`,
            html
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
        const html = templates.newOrderNotificationEmail(orderNumber, userNames, userLastName, userEmail, phone, userId, userAddress, userCity, userRegion, userOpcional, orderDetails, totalText)
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: "creaciones.lucero.papeleria@gmail.com",
            subject: `📦 Nueva Orden N°${orderNumber}`,
            html
        });

        res.json({ mensaje: "Correo de confirmación enviado a la tienda." });
    } catch (error) {
        console.error("❌ Error al enviar confirmación de compra a la tienda:", error);
        res.status(500).json({ error: "Error al enviar correo a tienda" });
    }
});

module.exports = router;
