const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    productName:     { type: String, required: true, trim: true },
    category:        { type: String, required: true, trim: true },
    price:           { type: Number, required: true, min: 0 },
    discount:        { type: Number, default: 0, min: 0, max: 100 },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    stock:           { type: Number, default: 0, min: 0 },
    leadTime:        { type: String, default: '7 days' },
    description:     { type: String, default: '' },
    imageUrl:        { type: String, default: '' },
    gstPercent:      { type: Number, default: 18 },
    unit:            { type: String, default: 'Nos' },
    warranty:        { type: String, default: '' },
    isActive:        { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
