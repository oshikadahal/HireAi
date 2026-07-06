const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

const wrapTemplate = (title, bodyHtml) => `
<!DOCTYPE html><html><head><meta charset="UTF-8" /></head>
<body style="margin:0;background:#F7F8FB;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#5B5BF6,#2DD4BF);padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:22px;">HireAI</h1>
      <p style="color:rgba(255,255,255,.85);margin:4px 0 0;font-size:13px;">${title}</p>
    </div>
    <div style="padding:28px 32px;color:#334155;font-size:15px;line-height:1.6;">
      ${bodyHtml}
    </div>
    <div style="padding:16px 32px;background:#F7F8FB;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
      © ${new Date().getFullYear()} HireAI
    </div>
  </div>
</body></html>`;

/**
 * Sends an email if SMTP creds are configured; otherwise no-ops quietly.
 * Never throws — a failed/disabled email must never break an API request.
 */
async function send({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`✉️  (email disabled) Would have sent "${subject}" to ${to}`);
    return;
  }
  try {
    await t.sendMail({ from: `"HireAI" <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (err) {
    console.error('Email send failed (non-fatal):', err.message);
  }
}

exports.sendWelcomeEmail = (to, name) =>
  send({
    to,
    subject: 'Welcome to HireAI 🎉',
    html: wrapTemplate(
      'Welcome aboard',
      `<p>Hi ${name},</p><p>Your account is ready. Upload your resume to get AI-matched to jobs that fit your skills.</p>`
    ),
  });

exports.sendApplicationConfirmEmail = (to, name, jobTitle, companyName) =>
  send({
    to,
    subject: `Application sent: ${jobTitle}`,
    html: wrapTemplate(
      'Application submitted',
      `<p>Hi ${name},</p><p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> is in. We'll let you know as soon as there's an update.</p>`
    ),
  });

exports.sendStatusUpdateEmail = (to, name, jobTitle, status) =>
  send({
    to,
    subject: `Update on your application: ${jobTitle}`,
    html: wrapTemplate(
      'Application status changed',
      `<p>Hi ${name},</p><p>Your application for <strong>${jobTitle}</strong> is now: <strong style="color:#5B5BF6;text-transform:capitalize">${status}</strong>.</p>`
    ),
  });

exports.sendInterviewEmail = (to, name, jobTitle, date, meetingLink) =>
  send({
    to,
    subject: `Interview scheduled: ${jobTitle}`,
    html: wrapTemplate(
      'Interview scheduled',
      `<p>Hi ${name},</p><p>You're scheduled for an interview for <strong>${jobTitle}</strong> on <strong>${new Date(date).toLocaleString()}</strong>.</p>${meetingLink ? `<p><a href="${meetingLink}">${meetingLink}</a></p>` : ''}`
    ),
  });
