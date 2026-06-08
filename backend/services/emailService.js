const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.log('---------------- WELCOME EMAIL SIMULATION ----------------');
      console.log(`To: ${userName} (${userEmail})`);
      console.log('Subject: Welcome to AI Career Copilot!');
      console.log(`Body: Hello ${userName}, you have successfully registered to AI Career Copilot.`);
      console.log('-----------------------------------------------------------');
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
    });

    const mailOptions = {
      from: `"AI Career Copilot" <${user}>`,
      to: userEmail,
      subject: 'Welcome to AI Career Copilot!',
      text: `Hello ${userName},\n\nYou have successfully registered to AI Career Copilot. We are excited to help you prepare for technical interviews, analyze resumes, track skill gaps, and explore visual roadmaps!\n\nBest regards,\nAI Career Copilot Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <h2>Welcome to AI Career Copilot, ${userName}!</h2>
          <p>You have successfully registered to our website.</p>
          <p>We are excited to help you:</p>
          <ul>
            <li>Analyze resumes for ATS scores</li>
            <li>Practice technical mock interviews</li>
            <li>Identify skill gaps and track progress</li>
            <li>Generate personalized learning roadmaps</li>
          </ul>
          <br />
          <p>Best regards,</p>
          <p><strong>AI Career Copilot Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email successfully sent to: ${userEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error.message);
  }
};

const sendResetPasswordEmail = async (userEmail, userName, resetLink) => {
  try {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.log('---------------- RESET PASSWORD EMAIL SIMULATION ----------------');
      console.log(`To: ${userName} (${userEmail})`);
      console.log('Subject: Reset Your Password - AI Career Copilot');
      console.log(`Link: ${resetLink}`);
      console.log('-----------------------------------------------------------');
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
    });

    const mailOptions = {
      from: `"AI Career Copilot" <${user}>`,
      to: userEmail,
      subject: 'Reset Your Password - AI Career Copilot',
      text: `Hello ${userName},\n\nYou requested to reset your password. Please click the link below to set a new password. This link is valid for 15 minutes.\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nAI Career Copilot Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
          <h2>Hello ${userName},</h2>
          <p>You requested to reset your password for your AI Career Copilot account.</p>
          <p>Please click the button below to set a new password. This link is valid for 15 minutes:</p>
          <div style="margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #536dfe; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <br />
          <p>If you did not request this, you can safely ignore this email.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>AI Career Copilot Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email successfully sent to: ${userEmail}`);
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendResetPasswordEmail,
};
