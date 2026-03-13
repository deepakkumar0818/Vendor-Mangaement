const nodemailer = require('nodemailer');

// Configure transporter — set EMAIL_USER and EMAIL_PASS in .env for real emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
});

/**
 * Notify vendors when a new RFQ is created.
 * @param {Array} vendors  - Array of { name, email }
 * @param {Object} rfq     - { rfqNumber, productName, category, quantity, deliveryLocation }
 * @param {Object} client  - { name, email }
 */
const notifyVendorsOfRFQ = async (vendors, rfq, client) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log(`📧 [EMAIL DISABLED] Would notify ${vendors.length} vendor(s) about ${rfq.rfqNumber}`);
        return;
    }

    const promises = vendors.map(vendor =>
        transporter.sendMail({
            from:    `"VMS Platform" <${process.env.EMAIL_USER}>`,
            to:      vendor.email,
            subject: `New RFQ ${rfq.rfqNumber} — ${rfq.productName} (${rfq.category})`,
            html: `
                <h2>New RFQ Received</h2>
                <p>Dear <strong>${vendor.name}</strong>,</p>
                <p>A new Request for Quotation has been posted that matches your category.</p>
                <table>
                    <tr><td><strong>RFQ #</strong></td><td>${rfq.rfqNumber}</td></tr>
                    <tr><td><strong>Product</strong></td><td>${rfq.productName}</td></tr>
                    <tr><td><strong>Category</strong></td><td>${rfq.category}</td></tr>
                    <tr><td><strong>Quantity</strong></td><td>${rfq.quantity}</td></tr>
                    <tr><td><strong>Delivery Location</strong></td><td>${rfq.deliveryLocation}</td></tr>
                </table>
                <br>
                <p>Please log in to the VMS platform to submit your quotation.</p>
                <p>Regards,<br>VMS Platform Team</p>
            `,
        }).catch(err => console.error(`Email failed to ${vendor.email}:`, err.message))
    );

    await Promise.all(promises);
};

module.exports = { notifyVendorsOfRFQ };
