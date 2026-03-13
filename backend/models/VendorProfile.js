const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
    userId:              { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName:         { type: String, default: '' },
    description:         { type: String, default: '' },
    location:            { type: String, default: '' },
    phone:               { type: String, default: '' },
    categories:          { type: [String], default: [] },
    avgRating:           { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:        { type: Number, default: 0 },
    deliveryReliability: { type: Number, default: 0 },  // percent
    responseTime:        { type: String, default: '' },
    orderSuccess:        { type: Number, default: 0 },  // percent
    satisfaction:        { type: Number, default: 0 },  // percent
    priceScore:          { type: Number, default: 0 },  // /100
    badge:               { type: String, default: null },
    isActive:            { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);
