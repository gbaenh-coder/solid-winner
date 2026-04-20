// ═══════════════════════════════════════════
//  config/email.js
//  Sends real emails via Gmail (Nodemailer)
// ═══════════════════════════════════════════
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // This is a Gmail App Password, not your real password
  }
});

// ── Email: New Application Received (sent to CLIENT) ──
const sendApplicationEmail = async ({ clientEmail, clientName, jobTitle, applicantName, applicantEmail, applicantPhone, coverLetter, proposedRate }) => {
  await transporter.sendMail({
    from: `"OddJob.ng" <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: `New Application for "${jobTitle}" — OddJob.ng`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1117;color:#ffffff;padding:40px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#00C27C;font-size:28px;margin:0;">OddJob<span style="color:#ffffff">.ng</span></h1>
        </div>
        <h2 style="color:#ffffff;margin-bottom:8px;">New Application Received! 🎉</h2>
        <p style="color:rgba(255,255,255,0.6);">Hi ${clientName}, someone just applied to your job posting.</p>
        <div style="background:#1A2230;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:20px;margin:24px 0;">
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 6px">JOB POSTING</p>
          <h3 style="color:#00C27C;margin:0;">${jobTitle}</h3>
        </div>
        <div style="background:#1A2230;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:20px;margin:24px 0;">
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 12px">APPLICANT DETAILS</p>
          <p style="margin:6px 0;"><strong>Name:</strong> ${applicantName}</p>
          <p style="margin:6px 0;"><strong>Email:</strong> <a href="mailto:${applicantEmail}" style="color:#00C27C">${applicantEmail}</a></p>
          <p style="margin:6px 0;"><strong>Phone:</strong> ${applicantPhone || 'Not provided'}</p>
          <p style="margin:6px 0;"><strong>Proposed Rate:</strong> ${proposedRate ? '₦' + proposedRate : 'Open to negotiation'}</p>
        </div>
        <div style="background:#1A2230;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:20px;margin:24px 0;">
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 12px">COVER LETTER</p>
          <p style="line-height:1.7;color:rgba(255,255,255,0.8);">${coverLetter}</p>
        </div>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;margin-top:32px;">OddJob.ng — Nigeria's #1 Gig Platform 🇳🇬</p>
      </div>
    `
  });
};

// ── Email: Application Confirmation (sent to FREELANCER) ──
const sendConfirmationEmail = async ({ applicantEmail, applicantName, jobTitle }) => {
  await transporter.sendMail({
    from: `"OddJob.ng" <${process.env.EMAIL_USER}>`,
    to: applicantEmail,
    subject: `Application Received — ${jobTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1117;color:#ffffff;padding:40px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#00C27C;font-size:28px;margin:0;">OddJob<span style="color:#ffffff">.ng</span></h1>
        </div>
        <h2>Application Submitted! 🚀</h2>
        <p style="color:rgba(255,255,255,0.6);">Hi ${applicantName}, your application has been sent to the client.</p>
        <div style="background:#1A2230;border:1px solid rgba(0,194,124,0.3);border-radius:10px;padding:20px;margin:24px 0;">
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 6px">YOU APPLIED FOR</p>
          <h3 style="color:#00C27C;margin:0;">${jobTitle}</h3>
        </div>
        <p style="color:rgba(255,255,255,0.6);line-height:1.7;">The client will review your application and reach out to you directly. Make sure to check your email and phone regularly.</p>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;margin-top:32px;">OddJob.ng — Nigeria's #1 Gig Platform 🇳🇬</p>
      </div>
    `
  });
};

// ── Email: Welcome new user ──
const sendWelcomeEmail = async ({ email, firstName }) => {
  await transporter.sendMail({
    from: `"OddJob.ng" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to OddJob.ng! 🎉',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0D1117;color:#ffffff;padding:40px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="color:#00C27C;font-size:28px;margin:0;">OddJob<span style="color:#ffffff">.ng</span></h1>
        </div>
        <h2>Welcome, ${firstName}! 👋</h2>
        <p style="color:rgba(255,255,255,0.6);line-height:1.7;">You've just joined Nigeria's #1 gig platform. Whether you're here to hire talent or get paid for your skills — you're in the right place.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${process.env.FRONTEND_URL}" style="background:#00C27C;color:#0D1117;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">Start Exploring Jobs</a>
        </div>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;margin-top:32px;">OddJob.ng — Nigeria's #1 Gig Platform 🇳🇬</p>
      </div>
    `
  });
};

module.exports = { sendApplicationEmail, sendConfirmationEmail, sendWelcomeEmail };
