(() => {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  const button = document.getElementById("loginButton");
  const message = document.getElementById("loginMessage");
  const passwordInput = document.getElementById("adminPassword");

  form.addEventListener("submit", async event => {
    event.preventDefault();
    message.textContent = "";
    button.disabled = true;
    button.textContent = "جارٍ التحقق...";

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.value })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 503) {
          message.textContent = "الحماية لم تكتمل بعد. راجع إعدادات Cloudflare.";
        } else {
          message.textContent = "كلمة المرور غير صحيحة.";
        }
        passwordInput.select();
        return;
      }

      const requested = new URLSearchParams(location.search).get("next") || "/admin/index.html";
      const destination = requested.startsWith("/admin/") || requested === "/admin"
        ? requested
        : "/admin/index.html";
      location.replace(destination);
    } catch {
      message.textContent = "تعذر الاتصال. تحقق من الإنترنت ثم أعد المحاولة.";
    } finally {
      button.disabled = false;
      button.textContent = "دخول آمن";
    }
  });
})();
