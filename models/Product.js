// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['libreta', 'cuaderno'],
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    specifications: {
        size: {
            type: String,
            default: "10 x 15 cm"
        },
        pages: {
            type: String,
            default: "70"
        },
        paper_weight: {
            type: String,
            default: "106 gr"
        },
        interior_type: {
            type: String,
            enum: [
                'Líneas (5mm)', 
                'Cuadros (5mm)', 
                'Puntos (5mm)', 
                'Blanco'
            ],
            default: 'Líneas (5mm)'
        },
        binding_type: {
            type: String,
            enum: [
                'Anillado superior',
                'Anillado lateral derecho',
                'Anillado lateral izquierdo'
            ],
            default: 'Anillado superior'
        },
        cover_type: {
            type: String,
            enum: ['Tapa dura', 'Tapa blanda'],
            default: 'Tapa dura'
        }
    },
    image: {
        type: String, // Ruta de la imagen
        default: null
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Esto actualiza automáticamente createdAt y updatedAt
});

// Índices para mejorar performance
productSchema.index({ type: 1 });
productSchema.index({ active: 1 });
productSchema.index({ createdAt: -1 });

// Middleware para actualizar updatedAt antes de guardar
productSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Método para obtener la URL completa de la imagen
productSchema.methods.getImageUrl = function(baseUrl = '') {
    if (this.image) {
        return this.image.startsWith('http') ? this.image : `${baseUrl}${this.image}`;
    }
    return null;
};

// Método para obtener las especificaciones como lista HTML
productSchema.methods.getSpecificationsHtml = function() {
    const specs = this.specifications;
    return [
        `Tamaño: ${specs.size}`,
        `${specs.pages} hojas de ${specs.paper_weight}`,
        `Interior: ${specs.interior_type}`,
        `${specs.binding_type}`,
        `${specs.cover_type}`
    ];
};

// Método estático para buscar productos activos
productSchema.statics.findActive = function() {
    return this.find({ active: true }).sort({ createdAt: -1 });
};

// Método estático para buscar por tipo
productSchema.statics.findByType = function(type) {
    return this.find({ type, active: true }).sort({ createdAt: -1 });
};

module.exports = mongoose.model("Product", productSchema);