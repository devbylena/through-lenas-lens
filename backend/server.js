
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

app.use(
    cors({
     origin: [
            "http://127.0.0.1:5500",
            "https://devbylena.github.io",
        ],
        methods: ["GET", "POST"],
    })
);

app.get("/", (req, res) => {
    res.send("Mein E-Mail-Backend läuft! 🎉");
});

app.post(
    "/api/contact",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 5,
    }),
    async (req, res) => {
        const { name, email, subject, message } = req.body || {};

        if (
            ![name, email, subject, message].every(
                value => typeof value === "string" && value.trim()
            )
        ) {
            return res.status(400).json({
                error: "Bitte fülle alle Felder aus.",
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        if (
            cleanName.length > 100 ||
            cleanEmail.length > 254 ||
            cleanSubject.length > 150 ||
            cleanMessage.length > 5000 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            return res.status(400).json({
                error: "Bitte überprüfe deine Eingaben.",
            });
        }

        try {
            const { data, error } = await resend.emails.send({
                from: process.env.MAIL_FROM,
                to: [process.env.MAIL_TO],
                replyTo: cleanEmail,
                subject: `Kontaktformular: ${cleanSubject}`,
                text:
                    `Name: ${cleanName}\n` +
                    `E-Mail: ${cleanEmail}\n\n` +
                    `Nachricht:\n${cleanMessage}`,
            });

            if (error) {
                console.error("Resend-Fehler:", error);
                return res.status(502).json({
                    error: "Die E-Mail konnte nicht versendet werden.",
                });
            }

            return res.status(200).json({
                message: "Nachricht erfolgreich gesendet!",
            });
        } catch (error) {
            console.error("Serverfehler:", error.message);
            return res.status(500).json({
                error: "Ein interner Fehler ist aufgetreten.",
            });
        }
    }
);

const port = process.env.PORT || 3000;

console.log("Erlaubte Webseite:", process.env.FRONTEND_ORIGIN);
app.listen(port, "0.0.0.0", () => {
    console.log(`Server läuft auf Port ${port}`);
});
