const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;
const SALT_ROUNDS = 10;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => console.error("❌ Error al conectar con MongoDB:", err));

// Esquema y modelo de usuario
const userSchema = new mongoose.Schema({
    nombre: String,
    email: { type: String, unique: true },
    password: String,
    ventas: { type: Number, default: 0 },
    resetCode: String,
    resetCodeExpires: Date
});

const Usuario = mongoose.model("Usuario", userSchema);

// Ruta: Registro de usuario (con hash de contraseña)
app.post("/usuarios", async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const existente = await Usuario.findOne({ email });
        if (existente) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: "Usuario registrado con éxito" });
    } catch (err) {
        console.error("Error al registrar usuario:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Ruta: Login (verificación segura)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Usuario.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Contraseña incorrecta" });
        }

        res.json({ nombre: user.nombre, email: user.email, id: user._id });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Sumar 1 venta al usuario (requiere el email)
app.post("/sumar-venta", async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        user.ventas += 1;
        await user.save();

        res.json({ mensaje: "Venta registrada", ventas: user.ventas });
    } catch (err) {
        console.error("Error al sumar venta:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

const emailjs = require('@emailjs/nodejs'); // Instala con npm si no lo tienes

app.post("/solicitar-reset", async (req, res) => {
    const { email } = req.body;
    console.log("📨 Solicitud de reset recibida para:", email); 
    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(404).json({ error: "Correo no registrado" });

        const code = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
        const expiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        user.resetCode = code;
        user.resetCodeExpires = expiration;
        await user.save();

        emailjs.init("k_9nZSnIjBCNH-26v"); // Inicializa EmailJS con tu User ID

        // ENVÍO CON EMAILJS
        const serviceID = 'service_jpxibh8';
        const templateID = 'template_m92i0to';

        // Parámetros para la plantilla de EmailJS (ajusta los nombres según tu plantilla)
        const templateParams = {
            to_email: email,
            user_name: user.nombre,
            reset_code: code
        };

        await emailjs.send(serviceID, templateID, templateParams);
        console.log('✅ Código enviado con éxito');
        
        res.json({ mensaje: "Código enviado por correo" });
    } catch (err) {
        console.error("Error al solicitar código:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

app.post("/confirmar-reset", async (req, res) => {
    const { email, code, nuevaPassword } = req.body;
    try {
        const user = await Usuario.findOne({ email });

        if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
            return res.status(400).json({ error: "Código inválido o expirado" });
        }

        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        user.password = hashedPassword;
        user.resetCode = null;
        user.resetCodeExpires = null;
        await user.save();

        res.json({ mensaje: "Contraseña actualizada correctamente" });
    } catch (err) {
        console.error("Error al confirmar código:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});


// Ruta de prueba (opcional)
app.get("/", (req, res) => {
    res.send("Servidor funcionando y conectado a MongoDB");
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo ✅`);
});
