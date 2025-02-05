const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (options) => {
    try {
        //TODO:  1) create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            auth: {
                user: '64c66c9ba3d6df',
                pass: '27de75132dcaaa'
            }
        });

        //TODO:  2) set options
        const mailOptions = {
            from: `SauceBxss <niga@testmail.com>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        //TODO: 3) send email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
        throw new Error('Error sending email');
    }
};

module.exports = sendEmail;
