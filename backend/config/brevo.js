const Brevo = require("@getbrevo/brevo");

const apiInstance = new Brevo.TransactionalEmailsApi();

// ✅ Set API Key
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

async function sendOTP(email, otp) {
  try {
    const sendSmtpEmail = {
        sender: { email: process.env.BREVO_SENDER_EMAIL, name: "NeuroLink.AI" },
      to: [{ email }],
      subject: "Your OTP Code",
      htmlContent: `
        <h2>Your OTP Code: <b>${otp}</b></h2>
        <p>This code is valid for 10 minutes.</p>
      `,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ OTP sent successfully:", response);
  } catch (error) {
    console.error("❌ Failed to send OTP:", error.response?.body || error.message);
  }
}

module.exports = { sendOTP };
