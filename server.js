/**
 * Simple Express server for T&M Ticket Generator
 * This is optional but useful for testing email functionality
 */

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, cc, subject, message, pdfData } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // For production, configure a real email service
    // This is just a test configuration
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    const attachments = [];
    
    if (pdfData) {
      attachments.push({
        filename: 'T&M_Ticket.pdf',
        content: pdfData.split(';base64,').pop(),
        encoding: 'base64'
      });
    }
    
    const mailOptions = {
      from: '"T&M Ticket Generator" <tm-ticket@example.com>',
      to,
      cc: cc || '',
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
      attachments
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully', 
      previewUrl: nodemailer.getTestMessageUrl(info) 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});