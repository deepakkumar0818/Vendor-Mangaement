const nodemailer = require('nodemailer');

// ── Transporter ────────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
});

const isEnabled = () => !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

// Core send helper — logs and skips gracefully when email is not configured
const send = async (mail) => {
    if (!isEnabled()) {
        console.log(`📧 [EMAIL DISABLED] To: ${mail.to} | Subject: ${mail.subject}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `"VMS Platform" <${process.env.EMAIL_USER}>`,
            ...mail,
        });
        console.log(`✅ Email sent → ${mail.to}`);
    } catch (err) {
        console.error(`❌ Email failed → ${mail.to} :`, err.message);
    }
};

// ── Shared HTML layout ─────────────────────────────────────────────────────────
const layout = (title, body) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-.3px;">VMS Platform</p>
                  <p style="margin:3px 0 0;color:#c7d2fe;font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.6px;">Vendor Management System</p>
                </td>
                <td align="right">
                  <span style="background:rgba(255,255,255,.15);color:#fff;font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;">${title}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:36px;">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:18px 36px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
              This is an automated message from <strong style="color:#6366f1;">VMS Platform</strong>. Please do not reply directly to this email.<br>
              © ${new Date().getFullYear()} VMS Platform · All rights reserved
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Styled helpers ─────────────────────────────────────────────────────────────
const infoRow = (label, value) => `
  <tr>
    <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;width:160px;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#1e293b;font-weight:500;">${value}</td>
  </tr>`;

const infoTable = (rows) => `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:20px 0;">
    <tbody style="background:#f8fafc;">
      ${rows}
    </tbody>
  </table>`;

const ctaButton = (label, href = '#') => `
  <div style="text-align:center;margin:28px 0 8px;">
    <a href="${href}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 32px;border-radius:10px;letter-spacing:.2px;">
      ${label}
    </a>
  </div>`;

const badge = (text, color = '#4f46e5', bg = '#eef2ff') =>
    `<span style="display:inline-block;background:${bg};color:${color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:.4px;">${text}</span>`;


// ═══════════════════════════════════════════════════════════════════════════════
// 1. Notify vendors of a new RFQ
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @param {Array}  vendors  — [{ name, email }]
 * @param {Object} rfq      — { rfqNumber, productName, category, quantity, deliveryLocation, deadline }
 * @param {Object} client   — { name, email }
 */
const notifyVendorsOfRFQ = async (vendors, rfq, client) => {
    const deadlineText = rfq.deadline
        ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Not specified';

    const promises = vendors.map(vendor => {
        const body = `
          <h2 style="margin:0 0 6px;font-size:20px;color:#1e293b;">New RFQ Opportunity 🎯</h2>
          <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
            Hello <strong style="color:#1e293b;">${vendor.name}</strong>,<br>
            A new Request for Quotation has been posted that matches your supply category.
            Log in to submit your best quote before the deadline.
          </p>

          ${infoTable(
              infoRow('RFQ Number',       `<strong>${rfq.rfqNumber}</strong>`) +
              infoRow('Product',          rfq.productName) +
              infoRow('Category',         badge(rfq.category, '#7c3aed', '#f5f3ff')) +
              infoRow('Quantity',         rfq.quantity) +
              infoRow('Delivery To',      rfq.deliveryLocation) +
              infoRow('Response Deadline', `<span style="color:#dc2626;font-weight:600;">${deadlineText}</span>`)
          )}

          <p style="margin:16px 0 4px;font-size:13px;color:#64748b;">
            📌 Posted by: <strong>${client.name}</strong>
          </p>

          ${ctaButton('View RFQ &amp; Submit Quote')}

          <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
            Act fast — quotes are compared in real time once submissions close.
          </p>`;

        return send({
            to:      vendor.email,
            subject: `📋 New RFQ ${rfq.rfqNumber} — ${rfq.productName} (${rfq.category})`,
            html:    layout('New RFQ', body),
        });
    });

    await Promise.all(promises);
};


// ═══════════════════════════════════════════════════════════════════════════════
// 2. Confirm quote submission to vendor
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @param {Object} vendor — { name, email }
 * @param {Object} rfq    — { rfqNumber, productName, category }
 * @param {Object} quote  — { price, discount, deliveryTime, deliveryCharges, paymentTerms, warranty }
 */
const confirmQuoteToVendor = async (vendor, rfq, quote) => {
    const effectivePrice = Math.round(
        quote.price * (1 - (quote.discount || 0) / 100) + (quote.deliveryCharges || 0)
    );

    const body = `
      <h2 style="margin:0 0 6px;font-size:20px;color:#1e293b;">Quote Submitted Successfully ✅</h2>
      <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
        Hello <strong style="color:#1e293b;">${vendor.name}</strong>,<br>
        Your quotation for <strong>${rfq.productName}</strong> has been submitted and is now visible to the client.
        Here's a summary of what you submitted:
      </p>

      ${infoTable(
          infoRow('RFQ Number',       `<strong>${rfq.rfqNumber}</strong>`) +
          infoRow('Product',          rfq.productName) +
          infoRow('Category',         badge(rfq.category, '#7c3aed', '#f5f3ff')) +
          infoRow('Unit Price',       `₹${Number(quote.price).toLocaleString('en-IN')}`) +
          infoRow('Discount Offered', `<span style="color:#16a34a;font-weight:600;">${quote.discount || 0}% off</span>`) +
          infoRow('Delivery Charges', quote.deliveryCharges === 0 ? badge('Free', '#16a34a', '#dcfce7') : `₹${Number(quote.deliveryCharges).toLocaleString('en-IN')}`) +
          infoRow('Delivery Time',    `${quote.deliveryTime} days`) +
          infoRow('Payment Terms',    quote.paymentTerms || 'Net 30') +
          (quote.warranty ? infoRow('Warranty', quote.warranty) : '') +
          infoRow('Effective Price',  `<strong style="color:#4f46e5;font-size:15px;">₹${effectivePrice.toLocaleString('en-IN')}</strong>`)
      )}

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#16a34a;font-weight:500;">
          🏆 The client will review all quotes and select the best vendor. You'll be notified of the outcome.
        </p>
      </div>

      ${ctaButton('View Your Submission')}`;

    await send({
        to:      vendor.email,
        subject: `✅ Quote Submitted — ${rfq.rfqNumber} | ${rfq.productName}`,
        html:    layout('Quote Confirmed', body),
    });
};


// ═══════════════════════════════════════════════════════════════════════════════
// 3. Notify client when a vendor responds to their RFQ
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @param {Object} client       — { name, email }
 * @param {Object} vendor       — { name, email }
 * @param {Object} rfq          — { rfqNumber, productName, category }
 * @param {Object} quote        — { price, discount, deliveryTime, deliveryCharges, paymentTerms }
 * @param {Number} totalQuotes  — total number of quotes received so far
 */
const notifyClientOfResponse = async (client, vendor, rfq, quote, totalQuotes = 1) => {
    const effectivePrice = Math.round(
        quote.price * (1 - (quote.discount || 0) / 100) + (quote.deliveryCharges || 0)
    );

    const body = `
      <h2 style="margin:0 0 6px;font-size:20px;color:#1e293b;">New Quote Received 💬</h2>
      <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
        Hello <strong style="color:#1e293b;">${client.name}</strong>,<br>
        <strong>${vendor.name}</strong> has submitted a quotation for your RFQ
        <strong>${rfq.rfqNumber}</strong>. You now have
        <strong style="color:#4f46e5;">${totalQuotes} quote${totalQuotes !== 1 ? 's' : ''}</strong> to compare.
      </p>

      ${infoTable(
          infoRow('RFQ Number',       `<strong>${rfq.rfqNumber}</strong>`) +
          infoRow('Product',          rfq.productName) +
          infoRow('Vendor',           `<strong style="color:#4f46e5;">${vendor.name}</strong>`) +
          infoRow('Quoted Price',     `₹${Number(quote.price).toLocaleString('en-IN')}`) +
          infoRow('Discount',         `<span style="color:#16a34a;font-weight:600;">${quote.discount || 0}% off</span>`) +
          infoRow('Effective Price',  `<strong style="color:#4f46e5;font-size:15px;">₹${effectivePrice.toLocaleString('en-IN')}</strong>`) +
          infoRow('Delivery Time',    `${quote.deliveryTime} days`) +
          infoRow('Delivery Charges', quote.deliveryCharges === 0 ? badge('Free', '#16a34a', '#dcfce7') : `₹${Number(quote.deliveryCharges).toLocaleString('en-IN')}`)
      )}

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#1d4ed8;font-weight:500;">
          📊 Head to <strong>Vendor Responses</strong> to compare all quotes side-by-side and pick the best vendor.
        </p>
      </div>

      ${ctaButton('Compare All Quotes Now')}`;

    await send({
        to:      client.email,
        subject: `💬 New Quote on ${rfq.rfqNumber} from ${vendor.name}`,
        html:    layout('New Quote', body),
    });
};


// ═══════════════════════════════════════════════════════════════════════════════
// 4. Welcome email on registration
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * @param {Object} user — { name, email, userRole }
 */
const sendWelcomeEmail = async (user) => {
    const isVendor = user.userRole === 'vendor';

    const roleSection = isVendor ? `
      <div style="margin:20px 0;">
        <p style="margin:0 0 12px;font-size:14px;color:#475569;font-weight:600;">As a Vendor, you can:</p>
        <table cellpadding="0" cellspacing="0">
          ${['📋 Receive RFQ requests matching your supply categories',
             '💰 Submit competitive quotations directly to clients',
             '📦 List your products in the vendor marketplace',
             '📈 Track your performance score and ratings',
             '🏆 Get classified as Preferred, Regular, or Monitor'].map(tip =>
               `<tr><td style="padding:5px 0;font-size:13px;color:#64748b;">${tip}</td></tr>`
             ).join('')}
        </table>
      </div>` : `
      <div style="margin:20px 0;">
        <p style="margin:0 0 12px;font-size:14px;color:#475569;font-weight:600;">As a Client, you can:</p>
        <table cellpadding="0" cellspacing="0">
          ${['📤 Create RFQs and broadcast them to matching vendors',
             '📊 Compare vendor quotes side-by-side in real time',
             '⭐ Rate and review vendors after each transaction',
             '🔍 Browse the vendor marketplace by category',
             '📈 Access analytics on spend and vendor performance'].map(tip =>
               `<tr><td style="padding:5px 0;font-size:13px;color:#64748b;">${tip}</td></tr>`
             ).join('')}
        </table>
      </div>`;

    const body = `
      <h2 style="margin:0 0 6px;font-size:20px;color:#1e293b;">Welcome to VMS Platform! 🎉</h2>
      <p style="margin:0 0 20px;color:#64748b;font-size:14px;line-height:1.6;">
        Hello <strong style="color:#1e293b;">${user.name}</strong>,<br>
        Your account has been created successfully as a
        ${badge(isVendor ? 'Vendor Partner' : 'Procurement Manager', '#4f46e5', '#eef2ff')}.
        We're excited to have you on board!
      </p>

      ${roleSection}

      <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:14px 18px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#7c3aed;font-weight:500;">
          💡 ${isVendor
            ? 'Complete your vendor profile and add your product categories so clients can find you.'
            : 'Start by creating your first RFQ to instantly notify matching vendors.'}
        </p>
      </div>

      ${ctaButton(isVendor ? 'Set Up My Vendor Profile' : 'Create My First RFQ')}

      <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
        Need help? Contact our support team anytime.
      </p>`;

    await send({
        to:      user.email,
        subject: `🎉 Welcome to VMS Platform, ${user.name}!`,
        html:    layout('Welcome', body),
    });
};


module.exports = {
    notifyVendorsOfRFQ,
    confirmQuoteToVendor,
    notifyClientOfResponse,
    sendWelcomeEmail,
};
