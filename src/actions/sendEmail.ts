"use server";

import React from "react";
import { Resend } from "resend";
import ContactFormEmail from "../components/emails/ContactFormEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (formData: FormData) => {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const senderEmail = formData.get("senderEmail") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!firstName || !lastName || !senderEmail || !subject || !message) {
    return { error: "All fields are required" };
  }

  try {
    const data = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: process.env.RESEND_TO_EMAIL,
      subject: `Contact Form: ${subject}`,
      reply_to: senderEmail,
      react: React.createElement(ContactFormEmail, { firstName, lastName, senderEmail, subject, message }),
    });
    return { data };
  } catch (err: any) {
    return { error: err.message || "Something went wrong" };
  }
};
