require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./controllers/authController");
const orderRoutes = require("./controllers/orderController");
const contactRoutes = require("./controllers/contactController");
const productRoutes = require("./controllers/productController"); // Nueva línea

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => console.error("❌ Error de conexión:", err));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/products", productRoutes); // Nueva línea

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Servidor funcionando y conectado a MongoDB");
});

// Ruta para servir el frontend (si lo tienes)
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({ message: "Ruta no encontrada" });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} ✅`);
    console.log(`Panel admin disponible en: http://localhost:${PORT}/admin`);
});