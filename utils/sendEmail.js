const nodemailer = require("nodemailer");

const createTransporter = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  const config = {
    host: "smtp.gmail.com",
    port: isDevelopment ? 587 : 465,
    secure: !isDevelopment,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  return nodemailer.createTransport(config);
};

const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email server connection verified");

    // Email options
    const mailOptions = {
      from: `"${process.env.APP_NAME || "ChatGuru"}" <${
        process.env.EMAIL_USER
      }>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error.message);

    // Don't throw error to prevent revealing user existence
    // Log the error but return success to maintain security
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to strip HTML for text version
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

module.exports = sendEmail;
