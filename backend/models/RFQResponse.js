const mongoose = require('mongoose');

const rfqResponseSchema = new mongoose.Schema({
    rfqId:           { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
    vendorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price:           { type: Number, required: true, min: 0 },
    discount:        { type: Number, default: 0, min: 0, max: 100 },
    deliveryTime:    { type: String, default: '' },
    deliveryCharges: { type: Number, default: 0, min: 0 },
    message:         { type: String, default: '' },
    paymentTerms:    { type: String, default: 'Net 30' },
    warranty:        { type: String, default: '' },
    validity:        { type: String, default: '30 days' },
}, { timestamps: true });

// One response per vendor per RFQ
rfqResponseSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

module.exports = mongoose.model('RFQResponse', rfqResponseSchema);
