require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./controllers/authController");
const orderRoutes = require("./controllers/orderController");
const contactRoutes = require("./controllers/contactController");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => console.error("❌ Error de conexión:", err));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/contact", contactRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Servidor funcionando y conectado a MongoDB");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT} ✅`);
});
