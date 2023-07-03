const nodemailer = require("nodemailer");

const sendMail = async (email, verifyToken) => {
  const verificationURL = `${process.env.CLIENT_URL}/verify/${verifyToken}`;
  const mailOptions = {
    from: '"world-radio" <chucksn611@hotmail.com>',
    to: email,
    subject: "Verify your email",
    html: `<h3>Verify your world-radio app user account by clicking the link below</h3><p><a href="${verificationURL}">${verificationURL}</a></p><h4>Link expires after 10 minutes</h4>`,
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
