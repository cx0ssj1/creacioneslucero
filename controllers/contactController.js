// /controllers/contactController.js
const express = require("express");
const transporter = require("../config/mailer");
const router = express.Router();

// Consulta de contacto
router.post("/consulta", async (req, res) => {
    const { phone, userEmail, userNames, userMessage } = req.body;
    console.log("📩 Nueva consulta recibida:", req.body);

    try {
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: "creaciones.lucero.papeleria@gmail.com",
            subject: "📩 Nueva Consulta de Cliente",
            html: `
                <h2>Consulta de Cliente</h2>
                <p><strong>Nombre:</strong> ${userNames}</p>
                <p><strong>Correo:</strong> ${userEmail}</p>
                <p><strong>Teléfono:</strong> ${phone}</p>
                <p><strong>Mensaje:</strong> ${userMessage}</p>
            `
        });

        res.json({ mensaje: "Consulta enviada correctamente." });
    } catch (error) {
        console.error("❌ Error al enviar consulta:", error);
        res.status(500).json({ error: "Error al enviar la consulta" });
    }
});

module.exports = router;
