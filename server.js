const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const USERS_FILE = "usuarios.json";

// Leer usuarios
app.get("/usuarios", (req, res) => {
    fs.readFile(USERS_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Error al leer el archivo" });
        res.json(JSON.parse(data));
    });
});

// Registrar usuario
app.post("/usuarios", (req, res) => {
    const { nombre, email, password } = req.body;
    console.log("Recibiendo datos:", req.body); // <-- Agrega esto para ver los datos recibidos

    fs.readFile(USERS_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Error al leer el archivo:", err);
            return res.status(500).json({ error: "Error al leer el archivo" });
        }

        let users = JSON.parse(data).usuarios;
        if (users.some(user => user.email === email)) {
            return res.status(400).json({ error: "El correo ya está registrado" });
        }

        const newUser = { id: users.length + 1, nombre, email, password };
        users.push(newUser);

        fs.writeFile(USERS_FILE, JSON.stringify({ usuarios: users }, null, 2), err => {
            if (err) {
                console.error("Error al guardar el usuario:", err);
                return res.status(500).json({ error: "Error al guardar el usuario" });
            }
            console.log("Usuario registrado con éxito:", newUser);
            res.status(201).json(newUser);
        });
    });
}); 

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
