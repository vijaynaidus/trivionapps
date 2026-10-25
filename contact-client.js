(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const submit = form.querySelector('button[type="submit"],input[type="submit"]');
  const privacy = document.createElement("label");
  privacy.className = "contact-consent";
  privacy.innerHTML = '<input type="checkbox" name="privacyConsent" required> <span>I agree that Trivion Apps may store these details to respond to my enquiry. <a href="/privacy" target="_blank">Privacy policy</a></span>';
  const honeypot = document.createElement("input");
  honeypot.type = "text";
  honeypot.name = "website";
  honeypot.tabIndex = -1;
  honeypot.autocomplete = "off";
  honeypot.setAttribute("aria-hidden", "true");
  honeypot.style.cssText = "position:absolute;left:-9999px;opacity:0";
  if (submit) {
    submit.before(privacy);
    submit.before(honeypot);
  } else {
    form.append(privacy, honeypot);
  }
  const style = document.createElement("style");
  style.textContent = ".contact-consent{display:flex;gap:10px;align-items:flex-start;margin:4px 0 8px;color:inherit;font:500 .78rem/1.5 Manrope,sans-serif}.contact-consent input{margin-top:3px;accent-color:#38bdf8}.contact-consent a{color:inherit;text-underline-offset:3px}";
  document.head.append(style);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const status = form.querySelector(".form-status");
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      message: String(data.get("message") || "").trim(),
      website: String(data.get("website") || ""),
      consent: data.get("privacyConsent") === "on",
      visitor: localStorage.getItem("trivion-visitor-id") || "anonymous",
    };
    if (status) {
      status.textContent = "Sending your enquiry securely...";
      status.style.display = "block";
    }
    if (submit) submit.disabled = true;
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send enquiry");
      form.reset();
      if (status) status.textContent = "Thank you. Your enquiry has been received securely.";
    } catch (error) {
      if (status) status.textContent = `${error.message}. You can also email support@trivionapps.com.`;
    } finally {
      if (submit) submit.disabled = false;
    }
  });
})();
