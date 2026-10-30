const path = require("path");
const express = require("express");
const { sendToSupport } = require("./support");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  express.static(path.join(__dirname, "..", "public"), {
    extensions: ["html"],
  }),
);

const MIN_FILL_TIME_MS = 3000;

app.post("/contact", (req, res) => {
  // Honeypot: real users never fill this in, so a value means a bot.
  if (req.body.website) {
    return res.json({ ok: true }); // same success reply, but no email sent since it returns here already if a bot filled it out
  }

  // Timing check: a human can't fill in the form in under 3 seconds.
  const elapsed = Date.now() - Number(req.body.formLoadedAt);
  if (!(elapsed >= MIN_FILL_TIME_MS)) {
    return res.json({ ok: true });
  }

  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const message = (req.body.message || "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      error: "Please fill in your name, email and message.",
    });
  }

  sendToSupport({ name, email, message });
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Calico Media site running at http://localhost:${PORT}`);
});
