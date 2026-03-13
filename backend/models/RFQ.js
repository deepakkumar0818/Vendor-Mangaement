const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
    clientId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rfqNumber:        { type: String, unique: true },
    productName:      { type: String, required: true, trim: true },
    category:         { type: String, required: true, trim: true },
    quantity:         { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    deadline:         { type: Date },
    description:      { type: String, default: '' },
    status:           { type: String, enum: ['open', 'closed', 'awarded'], default: 'open' },
    notifiedVendors:  { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

// Auto-generate RFQ number
rfqSchema.pre('save', async function () {
    if (!this.rfqNumber) {
        const count = await mongoose.model('RFQ').countDocuments();
        this.rfqNumber = `RFQ-${(1001 + count).toString().padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('RFQ', rfqSchema);
