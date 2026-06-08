import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: 'Your Reden Ecommerce OTP',
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  total: number
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.NODEMAILER_USER,
      to: email,
      subject: `Order Confirmation #${orderNumber}`,
      html: `
        <h2>Order Confirmed</h2>
        <p>Thank you for your purchase!</p>
        <p>Order Number: <strong>${orderNumber}</strong></p>
        <p>Total: <strong>$${total.toFixed(2)}</strong></p>
        <p>You will receive a shipping update soon.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
