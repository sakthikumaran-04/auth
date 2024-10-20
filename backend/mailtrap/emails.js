import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export async function sendVerificationEmail(email, verificationToken) {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });

    console.log("email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export async function sendWelcomeEmail(email, name) {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "29501c12-c430-40bb-be78-dbb647857a97",
      template_variables: {
        company_info_name: "Auth App",
        name: name,
      },
    });
    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.log("Error sending email", error);
  }
}

export async function sendResetPasswordToken(email, URL) {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", URL),
      category: "Reset Password",
    });
    console.log("email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export async function sendResetPasswordSuccess(email) {
  try {
    const recipient = [{ email }];
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset Password Success",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Reset Password Success",
    });
    console.log("email sent successfully", response);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}
