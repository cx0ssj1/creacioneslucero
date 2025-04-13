const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

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
    email: String,
    password: String,
});
const Usuario = mongoose.model("Usuario", userSchema);

// Ruta para obtener todos los usuarios (para login)
app.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.json({ usuarios });
    } catch (err) {
        res.status(500).json({ error: "Error al obtener usuarios" });
    }
});

// Ruta para registrar un nuevo usuario
app.post("/usuarios", async (req, res) => {
    const { nombre, email, password } = req.body;
    try {
        const existente = await Usuario.findOne({ email });
        if (existente) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const nuevoUsuario = new Usuario({ nombre, email, password });
        await nuevoUsuario.save();
        res.status(201).json(nuevoUsuario);
    } catch (err) {
        res.status(500).json({ error: "Error al registrar usuario" });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
