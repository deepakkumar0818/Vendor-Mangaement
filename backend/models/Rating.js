const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    vendorId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rfqId:         { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', default: null },
    rating:        { type: Number, required: true, min: 1, max: 5 },
    quality:       { type: Number, min: 1, max: 5 },
    delivery:      { type: Number, min: 1, max: 5 },
    price:         { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    review:        { type: String, default: '' },
}, { timestamps: true });

// One review per client per vendor
ratingSchema.index({ vendorId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
