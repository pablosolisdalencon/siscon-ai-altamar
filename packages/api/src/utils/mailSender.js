const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.warn('SENDGRID_API_KEY is not defined in environment variables');
}

const sendEmail = async ({ to, subject, html, fromName, fromEmail, attachments }) => {
    const msg = {
        to,
        from: {
            email: fromEmail || process.env.SMTP_USER || 'noreply@siscon-ai.com',
            name: fromName || 'Altamar MKT'
        },
        subject,
        html,
        ...(attachments && { attachments })
    };

    try {
        const response = await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid:', response[0].statusCode);
        return response;
    } catch (error) {
        console.error('Error sending email via SendGrid:', error);
        if (error.response) {
            console.error(error.response.body);
        }
        throw error;
    }
};

module.exports = { sendEmail };
