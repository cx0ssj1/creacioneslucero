const express = require("express");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const transporter = require("../config/mailer");
const templates = require("../config/emailTemplates");
const router = express.Router();
const SALT_ROUNDS = 10;

// Registro
router.post("/register", async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const existente = await Usuario.findOne({ email });
        if (existente) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();

        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password: hashedPassword,
            codigoVerificacion,
            verificado: false
        });

        await nuevoUsuario.save();
        
        const html = templates.registrationEmail(nombre, email, codigoVerificacion);
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: email,
            subject: "Verifica tu correo - Creaciones Lucero",
            html
        });

        res.status(201).json({ mensaje: "Usuario registrado. Verifica tu correo.", email });
    } catch (err) {
        console.error("Error en registro:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
        if (!user.verificado) return res.status(403).json({ error: "Debes verificar tu correo." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Contraseña incorrecta" });
        res.json({
            nombre: user.nombre,
            email: user.email,
            id: user._id
        });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Verificar Email
router.post("/verify-email", async (req, res) => {
    const { email, codigo } = req.body;
    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        if (user.codigoVerificacion !== codigo) {
            return res.status(400).json({ error: "Código incorrecto" });
        }

        user.verificado = true;
        user.codigoVerificacion = null;
        await user.save();
        const html = templates.verificationSuccessEmail(email);
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: email, 
            subject: "¡Correo verificado con éxito! 🎉",
            html
        });

        res.json({ mensaje: "Correo verificado correctamente" });
    } catch (err) {
        console.error("Error al verificar email:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Solicitar Código de Recuperación
router.post("/request-reset", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(404).json({ error: "Correo no registrado" });

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = resetCode;
        user.resetCodeExpires = new Date(Date.now() + 10 * 60000);
        await user.save();
        const html = templates.passwordResetEmail(email, resetCode);
        await transporter.sendMail({
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: email,
            subject: "Recuperar Contraseña - Creaciones Lucero",
            html
        });

        res.json({ mensaje: "Código enviado al correo" });
    } catch (err) {
        console.error("Error al solicitar reset:", err);
        res.status(500).json({ error: "Error al enviar correo" });
    }
});

// Confirmar Código y Nueva Contraseña
router.post("/confirm-reset", async (req, res) => {
    const { email, code, nuevaPassword } = req.body;
    try {
        const user = await Usuario.findOne({ email });
        if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
            return res.status(400).json({ error: "Código inválido o expirado" });
        }

        user.password = await bcrypt.hash(nuevaPassword, SALT_ROUNDS);
        user.resetCode = null;
        user.resetCodeExpires = null;
        await user.save();

        res.json({ mensaje: "Contraseña actualizada exitosamente" });
    } catch (err) {
        console.error("Error al confirmar reset:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Incrementar contador de ventas del usuario
router.post("/sumar-venta", async (req, res) => {
    const { email } = req.body;
    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        usuario.ventas += 1;
        await usuario.save();
        
        res.json({ 
            mensaje: "Venta registrada correctamente", 
            ventas: usuario.ventas 
        });
    } catch (err) {
        console.error("Error al registrar venta:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});
module.exports = router;