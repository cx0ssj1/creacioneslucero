// /models/Usuario.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    nombre: String,
    email: { type: String, unique: true },
    password: String,
    ventas: { type: Number, default: 0 },
    resetCode: String,
    resetCodeExpires: Date,
    verificado: { type: Boolean, default: false },
    codigoVerificacion: String
});

const Usuario = mongoose.model("Usuario", userSchema);

module.exports = Usuario;
