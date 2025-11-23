const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            auth: {
                user: process.env.SMTP_USERNAME, 
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: `Yatrify Tours <yatri@yatrify.com>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
        throw new Error('Error sending email');
    }
};

module.exports = sendEmail;
