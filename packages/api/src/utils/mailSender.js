const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { Company, Configuration } = require('../models/associations');

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Sends an email based on the company configuration (sendgrid, hosting, off).
 */
const sendEmail = async ({ to, subject, html, fromName, fromEmail, attachments }) => {
    try {
        // 1. Fetch Configuration for mailing_mode
        const config = await Configuration.findOne({ where: { clave: 'mailing_mode' } });
        const mode = config?.valor || 'off';

        if (mode === 'off') {
            console.log('Email suppressed: mailing_mode is set to OFF');
            return { success: true, message: 'Mailing disabled' };
        }

        // 2. Resolve From Email
        let finalFromEmail = fromEmail || company?.mail || company?.pago_mail || process.env.SMTP_USER || 'noreply@siscon-ai.com';
        const finalFromName = fromName || company?.razon || 'Altamar MKT';

        // 3. Send based on mode
        if (mode === 'sendgrid') {
            if (!process.env.SENDGRID_API_KEY) {
                throw new Error('SENDGRID_API_KEY is not defined');
            }

            const msg = {
                to,
                from: {
                    email: finalFromEmail,
                    name: finalFromName
                },
                subject,
                html,
                ...(attachments && { attachments })
            };

            const response = await sgMail.send(msg);
            console.log('Email sent via SendGrid:', response[0].statusCode);
            return response;

        } else if (mode === 'hosting') {
            // Native Hosting / SMTP mode
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'localhost',
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            const mailOptions = {
                from: `"${finalFromName}" <${finalFromEmail}>`,
                to,
                subject,
                html,
                attachments: attachments?.map(att => ({
                    filename: att.filename,
                    content: att.content,
                    encoding: 'base64'
                }))
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent via Hosting/SMTP:', info.messageId);
            return info;
        }

    } catch (error) {
        console.error(`Error in sendEmail (${fromEmail || 'unknown mode'}):`, error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
};

module.exports = { sendEmail };
