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

  try {
    await transporter.sendMail({
      from: `"Colorblend Creative Website" <${process.env.GMAIL_USER}>`,
      to: 'colorblendcreative@gmail.com',
      replyTo: email,
      subject: `New project inquiry from ${name}`,
      html: `
        <strong>Name:</strong> ${name}<br>
        <strong>Email:</strong> ${email}<br>
        <strong>Company:</strong> ${company || 'N/A'}<br>
        <strong>Budget:</strong> ${budget || 'N/A'}<br>
        <strong>Message:</strong><br>${(message || '').replace(/\n/g, '<br>')}
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}
