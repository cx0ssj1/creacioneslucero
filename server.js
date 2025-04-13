const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

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

// Ruta de prueba (opcional)
app.get("/", (req, res) => {
    res.send("Servidor funcionando y conectado a MongoDB");
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo ✅`);
});
