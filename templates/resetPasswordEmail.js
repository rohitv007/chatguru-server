const resetPasswordEmailTemplate = (username, resetUrl, expiryMinutes = 15) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ChatGuru - Password Reset Request</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 30px 20px; 
          text-align: center; 
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 300;
        }
        .content { 
          padding: 40px 30px; 
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        .message {
          font-size: 16px;
          margin-bottom: 30px;
          color: #555;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .reset-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 25px; 
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.2s;
        }
        .reset-button:hover {
          transform: translateY(-2px);
        }
        .url-fallback {
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
          border-left: 4px solid #667eea;
        }
        .url-text {
          word-break: break-all;
          font-family: monospace;
          font-size: 14px;
          color: #495057;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        .warning-icon {
          color: #856404;
          font-weight: bold;
        }
        .footer { 
          background-color: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          font-size: 14px; 
          color: #6c757d;
          border-top: 1px solid #dee2e6;
        }
        .security-note {
          font-size: 14px;
          color: #6c757d;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello ${username},
          </div>
          
          <div class="message">
            We received a request to reset your password. If you made this request, click the button below to create a new password:
          </div>
          
          <div class="button-container">
            <a href="${resetUrl}" class="reset-button">Reset My Password</a>
          </div>
          
          <div class="url-fallback">
            <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
            <div class="url-text">${resetUrl}</div>
          </div>
          
          <div class="warning">
            <span class="warning-icon">⚠️</span>
            <strong>Important:</strong> This link will expire in ${expiryMinutes} minutes for your security.
          </div>
          
          <div class="security-note">
            <p><strong>Didn't request this?</strong> No worries! Your password is still secure. Simply ignore this email and no changes will be made to your account.</p>
            <p>For your security, never share this link with anyone.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated email from ChatGuru.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = resetPasswordEmailTemplate;
