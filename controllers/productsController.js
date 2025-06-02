// controllers/productController.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Modelo de producto (crea este archivo si no existe)
const Product = require("../models/Product.js");

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "../public/img/productos");
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    },
    fileFilter: function (req, file, cb) {
        // Validar tipo de archivo
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
        }
    }
});

// GET - Obtener todos los productos
router.get("/", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// GET - Obtener productos por tipo
router.get("/type/:type", async (req, res) => {
    try {
        const { type } = req.params;
        const products = await Product.find({ type }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Error al obtener productos por tipo:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// GET - Obtener un producto por ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                message: "Producto no encontrado" 
            });
        }
        res.json(product);
    } catch (error) {
        console.error("Error al obtener producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// POST - Crear nuevo producto
router.post("/", upload.single('image'), async (req, res) => {
    try {
        const {
            type,
            name,
            price,
            description,
            specifications,
            image // Si viene como base64 desde Flet
        } = req.body;

        // Validar campos requeridos
        if (!name || !price || !type) {
            return res.status(400).json({
                message: "Faltan campos requeridos: name, price, type"
            });
        }

        let imagePath = null;

        // Si hay imagen como base64 (desde Flet)
        if (image && typeof image === 'string' && image.startsWith('data:')) {
            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `product-${Date.now()}.png`;
            const filepath = path.join(__dirname, "../public/img/productos", filename);
            
            fs.writeFileSync(filepath, buffer);
            imagePath = `/img/productos/${filename}`;
        }
        // Si hay imagen subida por multer
        else if (req.file) {
            imagePath = `/img/productos/${req.file.filename}`;
        }

        // Crear producto
        const newProduct = new Product({
            type,
            name,
            price: parseInt(price),
            description,
            specifications: typeof specifications === 'string' 
                ? JSON.parse(specifications) 
                : specifications,
            image: imagePath,
            stock: 0, // Stock inicial
            active: true
        });

        const savedProduct = await newProduct.save();
        
        res.status(201).json({
            message: "Producto creado exitosamente",
            product: savedProduct
        });

    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// PUT - Actualizar producto
router.put("/:id", upload.single('image'), async (req, res) => {
    try {
        const productId = req.params.id;
        const {
            type,
            name,
            price,
            description,
            specifications,
            image,
            stock,
            active
        } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ 
                message: "Producto no encontrado" 
            });
        }

        // Actualizar campos
        if (name) product.name = name;
        if (price) product.price = parseInt(price);
        if (description) product.description = description;
        if (type) product.type = type;
        if (stock !== undefined) product.stock = parseInt(stock);
        if (active !== undefined) product.active = active;
        
        if (specifications) {
            product.specifications = typeof specifications === 'string' 
                ? JSON.parse(specifications) 
                : specifications;
        }

        // Actualizar imagen si hay una nueva
        if (image && typeof image === 'string' && image.startsWith('data:')) {
            // Eliminar imagen anterior si existe
            if (product.image) {
                const oldImagePath = path.join(__dirname, "../public", product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `product-${Date.now()}.png`;
            const filepath = path.join(__dirname, "../public/img/productos", filename);
            
            fs.writeFileSync(filepath, buffer);
            product.image = `/img/productos/${filename}`;
        } else if (req.file) {
            // Eliminar imagen anterior
            if (product.image) {
                const oldImagePath = path.join(__dirname, "../public", product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            product.image = `/img/productos/${req.file.filename}`;
        }

        product.updatedAt = new Date();
        const updatedProduct = await product.save();

        res.json({
            message: "Producto actualizado exitosamente",
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// DELETE - Eliminar producto
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                message: "Producto no encontrado" 
            });
        }

        // Eliminar imagen asociada
        if (product.image) {
            const imagePath = path.join(__dirname, "../public", product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        
        res.json({ 
            message: "Producto eliminado exitosamente" 
        });

    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// PATCH - Actualizar stock
router.patch("/:id/stock", async (req, res) => {
    try {
        const { stock } = req.body;
        
        if (stock === undefined || isNaN(stock)) {
            return res.status(400).json({
                message: "Stock debe ser un número válido"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock: parseInt(stock), updatedAt: new Date() },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ 
                message: "Producto no encontrado" 
            });
        }

        res.json({
            message: "Stock actualizado exitosamente",
            product
        });

    } catch (error) {
        console.error("Error al actualizar stock:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

// PATCH - Activar/desactivar producto
router.patch("/:id/toggle", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                message: "Producto no encontrado" 
            });
        }

        product.active = !product.active;
        product.updatedAt = new Date();
        
        const updatedProduct = await product.save();

        res.json({
            message: `Producto ${product.active ? 'activado' : 'desactivado'} exitosamente`,
            product: updatedProduct
        });

    } catch (error) {
        console.error("Error al cambiar estado del producto:", error);
        res.status(500).json({ 
            message: "Error interno del servidor", 
            error: error.message 
        });
    }
});

module.exports = router;