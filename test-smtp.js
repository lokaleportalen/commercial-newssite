require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

console.log('Testing SMTP connection...\n');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Password:', process.env.SMTP_PASSWORD ? '***' + process.env.SMTP_PASSWORD.slice(-4) : 'NOT SET');
console.log('\n---\n');

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ SMTP connection failed:', error.message);
  } else {
    console.log('✅ SMTP server is ready to send emails!');
    console.log('\nTrying to send a test email...\n');
    
    transporter.sendMail({
      from: 'Nyheder <nyheder@news.lokaleportalen.dk>',
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email from Nyheder',
      text: 'This is a test email sent via SMTP!',
      html: '<p>This is a <strong>test email</strong> sent via SMTP!</p>'
    }, (err, info) => {
      if (err) {
        console.log('❌ Failed to send test email:', err.message);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
      }
    });
  }
});
