import React from "react";

type ContactFormEmailProps = {
  firstName: string;
  lastName: string;
  senderEmail: string;
  subject: string;
  message: string;
};

export default function ContactFormEmail({ firstName, lastName, senderEmail, subject, message }: ContactFormEmailProps) {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px", backgroundColor: "#f3f4f6", color: "#111827" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: "#fff", padding: "20px", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
        <h2 style={{ color: "#4f46e5", fontSize: "20px" }}>📩 New message from TCF Contact Form</h2>
        <hr style={{ borderColor: "#d1d5db", margin: "10px 0" }} />
        <p><strong>👤 Name:</strong> {firstName} {lastName}</p>
        <p><strong>📧 Email:</strong> {senderEmail}</p>
        <p><strong>📌 Subject:</strong> {subject}</p>
        <p><strong>📝 Message:</strong> {message}</p>
      </div>
    </div>
  );
}
