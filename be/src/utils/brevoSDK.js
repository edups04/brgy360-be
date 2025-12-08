import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = SibApiV3Sdk.ApiClient.instance;

const apiKey = process.env.BREVO_PK;
if (!apiKey) throw new Error("BREVO_PK is missing from environment");

// IMPORTANT: correct way to set the API key
client.authentications["api-key"].apiKey = process.env.BREVO_PK;

const api = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendTransactionalEmail = async (resetLink, email) => {
  try {
    const sendSmtpEmail = {
      sender: { email: process.env.GMAIL },
      to: [{ email }],
      subject: "Password Reset Request",
      htmlContent: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    };

    const response = await api.sendTransacEmail(sendSmtpEmail);
    console.log("Brevo OK:", response);
    return response;
  } catch (error) {
    console.error("Brevo ERROR:", error.response?.body || error);
    throw error;
  }
};