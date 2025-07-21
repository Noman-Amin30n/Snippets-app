export const verificationMailBody = (token: string, year: number) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 30px auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            }
            h2 {
                color: #111827;
            }
            p {
                color: #4b5563;
                font-size: 16px;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                background-color: #3b82f6;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: bold;
                margin-top: 20px;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #9ca3af;
                text-align: center;
            }
            </style>
        </head>
        <body>
            <div class="container">
            <h2>Verify Your Email</h2>
            <p>Hello,</p>
            <p>Thank you for signing up! Please confirm your email address to complete your registration.</p>
            <a href="${process.env.BASE_URL}/verify?token=${token}" class="button">Verify Email</a>
            <p>If you didn’t create an account, you can safely ignore this email.</p>
            <div class="footer">
                &copy; ${year} Your Company. All rights reserved.
            </div>
            </div>
        </body>
        </html>`;
};
