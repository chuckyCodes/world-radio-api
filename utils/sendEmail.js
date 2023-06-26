const nodemailer = require("nodemailer");

const sendMail = async (email, verifyToken) => {
  const verificationURL = `${process.env.CLIENT_BASE_URL}/verify/${verifyToken}`;
  const mailOptions = {
    from: '"world-radio" <chucksn611@hotmail.com>',
    to: email,
    subject: "Verify your email",
    html: `<p>Verify your email by clicking the link below</p><p><a href="${verificationURL}">${verificationURL}</a></p>`,
  };
  try {
    const transporter = nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_USER_PASS,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    if (info) console.log("verification email sent");
  } catch (error) {
    console.error(error, "Error sending verification email");
  }
};

module.exports = sendMail;
