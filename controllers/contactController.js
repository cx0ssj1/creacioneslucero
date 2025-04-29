const express = require("express");
const transporter = require("../config/mailer");
const templates = require("../config/emailTemplates");
const router = express.Router();

// Consulta de contacto
router.post("/consulta", async (req, res) => {
    const { phone, userEmail, userNames, userMessage } = req.body;
    console.log("📩 Nueva consulta recibida:", req.body);

    try {
        const html = templates.contactFormEmail(userNames, userEmail, phone, userMessage);
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: "creaciones.lucero.papeleria@gmail.com",
            subject: "📩 Nueva Consulta de Cliente",
            html
        });

        res.json({ mensaje: "Consulta enviada correctamente." });
    } catch (error) {
        console.error("❌ Error al enviar consulta:", error);
        res.status(500).json({ error: "Error al enviar la consulta" });
    }
});

module.exports = router;
