const {
    BREVO_API_KEY,
    SENDER_EMAIL,
    SENDER_NAME,
} = require("../secrets.js");

/**
 * Send email using Brevo REST API
 */
console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY);
const sendEmail = async (to, subject, htmlContent, options = {}) => {
    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": BREVO_API_KEY,
            },
            body: JSON.stringify({
                sender: {
                    name: options.senderName || SENDER_NAME || "ChatNovaAI",
                    email: options.senderEmail || SENDER_EMAIL,
                },

                to: [{ email: to }],

                subject,

                htmlContent,

                ...(options.replyTo && {
                    replyTo: {
                        email: options.replyTo,
                    },
                }),

                ...(options.cc && {
                    cc: options.cc.map((email) => ({ email })),
                }),

                ...(options.bcc && {
                    bcc: options.bcc.map((email) => ({ email })),
                }),

                ...(options.attachment && {
                    attachment: options.attachment,
                }),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Brevo Error:", data);
            throw new Error(data.message || "Failed to send email");
        }

        console.log("Email sent successfully");
        console.log(data);

        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

/**
 * Send OTP email
 * @param {string} to - Recipient email address
 * @param {string|number} otp - The OTP code
 * @param {string} type - 'login' or 'verification'
 * @param {string} name - Recipient's name
 */
const sendOTPEmail = async (
    to,
    otp,
    type = "login",
    name = ""
) => {
    const isLogin = type === "login";
    const isVerification = type === "verification";

    let subject, expiryMinutes;

    if (isLogin) {
        subject = `Your ChatNovaAI Login OTP - ${otp}`;
        expiryMinutes = 5;
    } else if (isVerification) {
        subject = `Verify your ChatNovaAI Email - OTP: ${otp}`;
        expiryMinutes = 10;
    } else {
        subject = `Your ChatNovaAI OTP - ${otp}`;
        expiryMinutes = 5;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; padding: 30px; margin: 0;">

<div style="max-width: 600px; margin: auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="text-align: center; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px;">
        <h2 style="color: #4F46E5; margin: 0; font-size: 28px;">ChatNovaAI</h2>
        <p style="color: #6B7280; margin: 5px 0 0; font-size: 14px;">${isLogin ? 'Login Authentication' : 'Email Verification'}</p>
    </div>

    <!-- Greeting -->
    <p style="font-size: 16px; color: #374151; margin: 0 0 25px 0;">
        Hello ${name || "User"},
    </p>

    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 30px 0;">
        ${isLogin
            ? "We received a request to log in to your ChatNovaAI account. Use the One-Time Password (OTP) below to complete your login."
            : "Please use the One-Time Password (OTP) below to verify your email address and unlock full access to ChatNovaAI."
        }
    </p>

    <!-- OTP Box -->
    <div style="
        background: #EEF2FF;
        border: 2px dashed #8B5CF6;
        border-radius: 10px;
        padding: 30px;
        text-align: center;
        margin: 30px 0;
    ">
        <p style="
            margin: 0 0 8px 0;
            font-size: 12px;
            color: #6B7280;
            letter-spacing: 2px;
            text-transform: uppercase;
        ">
            One-Time Password
        </p>
        <p style="
            margin: 0;
            font-size: 44px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #4F46E5;
        ">
            ${otp}
        </p>
    </div>

    <!-- Validity Info -->
    <p style="
        font-size: 14px;
        color: #6B7280;
        text-align: center;
        margin: 20px 0 30px 0;
    ">
        This OTP is valid for 
        <strong style="color: #374151;">${expiryMinutes} minutes</strong>.
        Do not share this OTP with anyone.
    </p>

    <!-- Security Warning -->
    <div style="
        background: #FEF3C7;
        border-left: 4px solid #F59E0B;
        padding: 12px 16px;
        border-radius: 4px;
        margin: 25px 0;
    ">
        <p style="
            margin: 0;
            font-size: 13px;
            color: #92400E;
        ">
            ${isLogin
            ? "If you did not request this OTP, you can safely ignore this email. Your account remains secure."
            : "If you did not sign up for ChatNovaAI, you can safely ignore this email."
        }
        </p>
    </div>

    <!-- Footer -->
    <div style="
        border-top: 1px solid #E5E7EB;
        padding-top: 25px;
        margin-top: 30px;
        text-align: center;
    ">
        <p style="
            margin: 0;
            font-size: 12px;
            color: #9CA3AF;
        ">
            &copy; ${new Date().getFullYear()} ChatNovaAI. All rights reserved.
        </p>
        <p style="
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #9CA3AF;
        ">
            This is an automated message — please do not reply.
        </p>
    </div>

</div>

</body>
</html>
`;

    return sendEmail(to, subject, htmlContent);
};

/**
 * Send a custom email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML content
 * @param {object} options - Additional options
 */
const sendCustomEmail = async (to, subject, htmlContent, options = {}) => {
    return sendEmail(to, subject, htmlContent, options);
};

module.exports = {
    sendEmail,
    sendOTPEmail,
    sendCustomEmail,
};