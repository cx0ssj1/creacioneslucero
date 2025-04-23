const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

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
    resetCodeExpires: Date,
    verificado: { type: Boolean, default: false },
    codigoVerificacion: String
});

const Usuario = mongoose.model("Usuario", userSchema);

// Configura NodeMailer con Gmail
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "creaciones.lucero.papeleria@gmail.com",
        pass: "eopf iwnk ntzd ujnd"
    }
});

// Registro de usuario
app.post("/usuarios", async (req, res) => {
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

        const mailOptions = {
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: email,
            subject: "Verifica tu correo - Creaciones Lucero",
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
                <h2 style="color: #2196F3;">Verificación de Correo</h2>
                <p>Hola <strong>${nombre}</strong>,</p>
                <p>Gracias por registrarte en <strong>Creaciones Lucero</strong>.</p>
                <p>Tu código de verificación es:</p>
                <div style="background-color: #e3f2fd; border: 2px dashed #2196F3; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #0d47a1;">
                    ${codigoVerificacion}
                </div>
                <p style="margin-top: 20px;">Este código es válido por <strong>una sola vez</strong>.</p>
                <p style="margin-top: 40px;">Saludos cordiales,<br><strong>Creaciones Lucero</strong></p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Código de verificación enviado");

        res.status(201).json({ mensaje: "Usuario registrado. Verifica tu correo.", email });
    } catch (err) {
        console.error("Error al registrar usuario:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

        if (!user.verificado) {
            return res.status(403).json({ error: "Debes verificar tu correo para iniciar sesión." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Contraseña incorrecta" });

        res.json({ nombre: user.nombre, email: user.email, id: user._id });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// Sumar venta
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

// Solicitar código de recuperación
app.post("/solicitar-reset", async (req, res) => {
    const { email } = req.body;
    console.log("📨 Solicitud de reset recibida para:", email);

    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(404).json({ error: "Correo no registrado" });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiration = new Date(Date.now() + 10 * 60 * 1000);

        user.resetCode = code;
        user.resetCodeExpires = expiration;
        await user.save();

        const mailOptions = {
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: email,
            subject: "Recuperación de Contraseña - Creaciones Lucero",
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
                <h2 style="color: #4CAF50;">Recuperación de Contraseña</h2>
                <p>Hola <strong>${user.nombre}</strong>,</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña en <strong>Creaciones Lucero</strong>.</p>
                <p>Tu código de verificación es:</p>
                <div style="background-color: #e9f5ee; border: 2px dashed #4CAF50; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #2e7d32;">
                    ${code}
                </div>
                <p style="margin-top: 20px;">Este código es válido por <strong>10 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                <p style="margin-top: 40px;">Saludos cordiales,<br><strong>Creaciones Lucero</strong></p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0;">
                <p style="font-size: 12px; color: #888;">Este mensaje fue generado automáticamente. Por favor, no respondas a este correo.</p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Código enviado por Gmail");

        res.json({ mensaje: "Código enviado por correo" });
    } catch (err) {
        console.error("❌ Error al solicitar código:", err);
        res.status(500).json({ error: "Error al enviar correo" });
    }
});

// Confirmar código y actualizar contraseña
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

// Confirmar verificación de email
app.post("/verificar-email", async (req, res) => {
    const { email, codigo } = req.body;

    try {
        const user = await Usuario.findOne({ email });
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        if (user.verificado) {
            return res.status(400).json({ error: "El correo ya está verificado" });
        }

        if (user.codigoVerificacion !== codigo) {
            return res.status(400).json({ error: "Código incorrecto" });
        }

        user.verificado = true;
        user.codigoVerificacion = null;
        await user.save()
        .then(async () => {
            console.log("✅ Usuario verificado guardado exitosamente");
        const mailOptions = {
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: email,
            subject: "¡Correo verificado con éxito!",
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto;">
                <h2 style="color: #4CAF50;">¡Gracias por verificar tu cuenta!</h2>
                <p>Hola <strong>${user.nombre}</strong>,</p>
                <p>Tu cuenta en <strong>Creaciones Lucero</strong> ha sido verificada exitosamente.</p>
                <p>Ahora puedes iniciar sesión y comenzar a disfrutar de nuestros productos personalizados.</p>
                <p style="margin-top: 40px;">Saludos cordiales,<br><strong>Creaciones Lucero</strong></p>
            </div>
            `
        };
            await transporter.sendMail(mailOptions);
            console.log("📩 Confirmación de verificación enviada");
        })
        .catch(error => console.error("❌ Error al guardar verificación:", error));
        res.json({ mensaje: "Correo verificado correctamente" });
    } catch (err) {
        console.error("Error al verificar correo:", err);
        res.status(500).json({ error: "Error del servidor" });
    }
});

app.post("/confirmacioncompra", async (req, res) => {
    const { userEmail, orderDetails, userNames, userAddress, userCity, userRegion, orderNumber, totalText } = req.body;
    console.log("📦 Confirmación de compra recibida:", req.body);

    try {
        const mailOptions = {
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: userEmail, // destinatario dinámico
            subject: `🛍️ Confirmación de Pedido N°${orderNumber}`,
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
                <div style="background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #5a5a5a;">Hola ${userNames},</h2>
                    <p>¡Gracias por tu compra en <strong>Creaciones Lucero</strong>! 🎉</p>
                    <p>Hemos recibido tu pedido con el número <strong>N°${orderNumber}</strong> y estamos procesándolo.</p>
                    <div style="background: #e0f7fa; padding: 8px; border-radius: 5px;">
                    <h3 style="color: #5a5a5a;">📝 Detalles de tu compra:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Total de tu Compra:</strong> $${totalText}</li>
                        <li><strong>Productos Solicitados:</strong></li>
                        <li>${orderDetails}</li>
                        <li><strong>Número de Pedido:</strong> N°${orderNumber}</li>
                    </ul>
                    </div>
                    <h3 style="color: #5a5a5a;">📦 Envío:</h3>
                    <p>Tu pedido será enviado a la siguiente dirección:<br>
                    ${userAddress}, ${userCity}, Región: ${userRegion}.</p>
                    <p>Si deseas cambiar la dirección de envío, por favor contáctanos.</p>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos con tu número de pedido (N°${orderNumber}) al siguiente WhatsApp: 📞 +56 9 8858 1495.</p>
                    <p>¡Esperamos que disfrutes tu compra! 💖</p>
                    <div style="margin-top: 20px; text-align: center; font-size: 0.9em; color: #888;">
                        Saludos,<br><strong>Creaciones Lucero</strong>
                    </div>
                </div>
            </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log("✅ Confirmación enviada a", userEmail);
        res.json({ mensaje: "Correo enviado correctamente." });
    } catch (error) {
        console.error("❌ Error al enviar confirmación de compra:", error);
        res.status(500).json({ error: "Error al enviar confirmación de compra" });
    }
    
});

app.post("/confirmacioncompratienda", async (req, res) => {
    const { orderDetails, phone, userEmail, userNames, userLastName, userId, userAddress, userOpcional, userCity, userRegion, orderNumber, totalText  } = req.body;
    console.log("📦 Confirmación de compra recibida:", req.body);

    try {
        const mailOptions = {
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: "creaciones.lucero.papeleria@gmail.com",
            subject: `📦 Llego Nueva orden N°${orderNumber}`,
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
                <div style="background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <h2>Hola,</h2>
                    <p>Se ha recibido una nueva orden en <strong>Creaciones Lucero</strong>.</p>
                    <div style="background: #e0f7fa; padding: 8px; border-radius: 5px;">
                        <h3>Detalles de la Orden:</h3>
                        <p>${orderDetails}</p>
                        <p><strong>Total de la Compra:</strong> $${totalText}</p>
                        <p><strong>Número de Pedido: N°</strong> ${orderNumber}</p>
                    </div>
                    <h3>Datos del Cliente:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>RUT:</strong> ${userId}</li>
                        <li><strong>Nombre:</strong> ${userNames}</li>
                        <li><strong>Apellido:</strong> ${userLastName}</li>
                        <li><strong>Teléfono:</strong> ${phone}</li>
                        <li><strong>Correo Electrónico:</strong> ${userEmail}</li>
                    </ul>
                    <h3>Dirección de Entrega:</h3>
                    <ul style="list-style: none; padding: 0;">
                        <li><strong>Dirección:</strong> ${userAddress}</li>
                        <li><strong>Comuna:</strong> ${userCity}</li>
                        <li><strong>Región:</strong> ${userRegion}</li>
                        <li><strong>Casa / Depto / Oficina (opcional):</strong> ${userOpcional}</li>
                    </ul>
                    <p>Por favor, procede a revisar y procesar la orden.</p>
                    <div style="margin-top: 20px; text-align: center; font-size: 0.9em; color: #888;">
                        Saludos,<br>El equipo de Creaciones Lucero
                    </div>
                </div>
            </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log("✅ Confirmación enviada a", userEmail);
        res.json({ mensaje: "Correo enviado correctamente." });
    } catch (error) {
        console.error("❌ Error al enviar confirmación de compra:", error);
        res.status(500).json({ error: "Error al enviar confirmación de compra" });
    }
    
});

app.post("/emailcontacto", async (req, res) => { 
    const {phone, userEmail, userNames, userMessage } = req.body;
    console.log("📩 Consulta recibida:", req.body);
    try {
        const mailOptions = {
            from: '"Creaciones Lucero" <creaciones.lucero.papeleria@gmail.com>',
            to: "creaciones.lucero.papeleria@gmail.com", // o cualquier otro destinatario
            subject: "📩 Nueva Consulta Recibida",
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
                    <div style="background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #5a5a5a;">Nueva Consulta Recibida</h2>
                    <p><strong>Nombre del Cliente:</strong> ${userNames}</p>
                    <p><strong>Correo Electrónico:</strong> ${userEmail}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                    <p><strong>Mensaje:</strong> ${userMessage}</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log("✅ Consulta enviada a", userEmail);
        res.json({ mensaje: "Correo enviado correctamente." });
    } catch (error) {
        console.error("❌ Error al enviar consulta:", error);
        res.status(500).json({ error: "Error al enviar consulta" });
    }
    
});

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("Servidor funcionando y conectado a MongoDB");
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo ✅`);
});
