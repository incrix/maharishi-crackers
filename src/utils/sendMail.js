import nodemailer from "nodemailer";

export const sendVerificationMail = async ({ billingDetails, invoice }) => {
  const port = parseInt(process.env.MAIL_PORT, 10) || 465;
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await new Promise((resolve, reject) => {
    transporter.verify(function (error, success) {
      if (error) reject(error);
      else resolve(success);
    });
  });

  const mailInfo = {
    from: `"no-reply" <${process.env.MAIL_USER}>`,
    to: process.env.ORDER_MAIL,
    cc: process.env.ORDER_MAIL_CC,
    subject: `Online Order List for ${billingDetails.name}`,
    html: `
    <main style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
      <div style="text-align: center;">
        <h1 style="color: #1a4d2e;">New Order - Maharishi Crackers</h1>
        <p style="padding: 10px 20px;">Order list is attached below</p>
      </div>
      <div style="padding: 20px;">
        <h2 style="color: #b8963e;">Customer Details</h2>
        <p>Name: ${billingDetails.name}</p>
        <p>Email: ${billingDetails.email}</p>
        <p>Phone: ${billingDetails.phone}</p>
        <p>Address: ${billingDetails.address}</p>
        <p>City: ${billingDetails.city}</p>
        <p>State: ${billingDetails.state}</p>
        <p>Zip: ${billingDetails.zip}</p>
      </div>
    </main>
    `,
    attachments: [
      {
        filename: "invoice.pdf",
        content: invoice,
        encoding: "base64",
      },
    ],
  };

  await new Promise((resolve, reject) => {
    transporter.sendMail(mailInfo, function (error, info) {
      if (error) {
        console.log("Error: ", error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
};
