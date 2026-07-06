export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const nodemailer = require('nodemailer');

  const { name, email, company, budget, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const brandHeader = `
    <div style="background:#0F1623;padding:24px 32px;">
      <span style="color:#ffffff;font-size:18px;font-weight:700;font-family:Roboto,Arial,sans-serif;">Colorblend Creative</span>
    </div>
  `;

  const brandFooter = `
    <div style="padding:20px 32px;color:#6B7280;font-size:12px;font-family:Roboto,Arial,sans-serif;border-top:1px solid #E2E6F0;">
      Colorblend Creative — Websites & Business Systems<br>
      colorblendcreative@gmail.com
    </div>
  `;

  // Email 1: notify you of the new inquiry
  const notifyHtml = `
    <div style="font-family:Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #E2E6F0;border-radius:12px;overflow:hidden;">
      ${brandHeader}
      <div style="padding:32px;">
        <h2 style="color:#0F1623;margin-top:0;">New project inquiry</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0F1623;">
          <tr><td style="padding:8px 0;color:#6B7280;width:120px;">Name</td><td style="padding:8px 0;">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Email</td><td style="padding:8px 0;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Company</td><td style="padding:8px 0;">${company || 'N/A'}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Budget</td><td style="padding:8px 0;">${budget || 'N/A'}</td></tr>
        </table>
        <p style="color:#6B7280;margin-top:20px;margin-bottom:6px;">Project details</p>
        <p style="background:#F4F6FB;padding:16px;border-radius:8px;color:#0F1623;white-space:pre-line;">${message}</p>
      </div>
      ${brandFooter}
    </div>
  `;

  // Email 2: auto-reply confirmation to the visitor
  const autoReplyHtml = `
    <div style="font-family:Roboto,Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #E2E6F0;border-radius:12px;overflow:hidden;">
      ${brandHeader}
      <div style="padding:32px;">
        <h2 style="color:#0F1623;margin-top:0;">Thanks, ${name} — I've got your message</h2>
        <p style="color:#0F1623;line-height:1.6;">
          I received your project inquiry and will reply within 24 hours with next steps.
        </p>
        <p style="color:#6B7280;margin-top:20px;margin-bottom:6px;">Here's a copy of what you sent:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0F1623;">
          <tr><td style="padding:8px 0;color:#6B7280;width:120px;">Company</td><td style="padding:8px 0;">${company || 'N/A'}</td></tr>
          <tr><td style="padding:8px 0;color:#6B7280;">Budget</td><td style="padding:8px 0;">${budget || 'N/A'}</td></tr>
        </table>
        <p style="background:#F4F6FB;padding:16px;border-radius:8px;color:#0F1623;white-space:pre-line;margin-top:12px;">${message}</p>
        <p style="color:#6B7280;margin-top:24px;">Talk soon,<br><strong style="color:#0F1623;">Colorblend Creative</strong></p>
      </div>
      ${brandFooter}
    </div>
  `;

  try {
    // send notification to you
    await transporter.sendMail({
      from: `"Colorblend Creative Website" <${process.env.GMAIL_USER}>`,
      to: 'colorblendcreative@gmail.com',
      replyTo: email,
      subject: `New project inquiry from ${name}`,
      html: notifyHtml,
    });

    // send confirmation to the visitor
    await transporter.sendMail({
      from: `"Colorblend Creative" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Thanks for reaching out, ${name}!`,
      html: autoReplyHtml,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}
