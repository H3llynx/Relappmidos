// ---- CAPTCHA -------------------
let captchaId = ""

// Avoid abusive captcha reloads:
let dailyLimitReached = false;
const maxCaptchaReloads = 5;
const maxDailyReloads = 20;
const reloadCooldown = 60000; // 1 minute
let reloadTimestamps = JSON.parse(localStorage.getItem("reloadTimestamps")) || [];
let reloads = Number(localStorage.getItem("reloads")) || 0;

// Check daily reset:
const checkDailyReset = () => {
    const today = new Date().toDateString();
    const savedDay = localStorage.getItem("lastVisitDay");
    if (savedDay !== today) {
        dailyLimitReached = false;
        reloads = 0;
        localStorage.setItem("reloads", reloads);
        reloadTimestamps = [];
        localStorage.setItem("lastVisitDay", today);
        localStorage.setItem("reloadTimestamps", JSON.stringify(reloadTimestamps));
    }
}
checkDailyReset();

// Loads captcha:
const loadCaptcha = async (showAlert = true) => {
    if (dailyLimitReached) {
        if (showAlert) {
            const box = document.getElementById("captcha-abuse");
            document.getElementById("captcha-abuse-msg").textContent = "Too many CAPTCHA reloads for today. Try again tomorrow.";
            box.showModal();
        }
        return;
    }
    else {
        const now = Date.now();
        reloadTimestamps = reloadTimestamps.filter(time => now - time < reloadCooldown);

        if (reloadTimestamps.length >= maxCaptchaReloads) {
            if (showAlert) {
                const box = document.getElementById("captcha-abuse");
                document.getElementById("captcha-abuse-msg").textContent = "Too many CAPTCHA reloads, please wait a minute!";
                box.showModal();
            }
            return;
        }
        else if (reloads >= maxDailyReloads) {
            dailyLimitReached = true;
            if (showAlert) {
                const box = document.getElementById("captcha-abuse");
                document.getElementById("captcha-abuse-msg").textContent = "Too many CAPTCHA reloads for today. Try again tomorrow.";
                box.showModal();
            }
            return;
        }
        else {
            reloads++
            localStorage.setItem("reloads", reloads);
            reloadTimestamps.push(now);
            localStorage.setItem("reloadTimestamps", JSON.stringify(reloadTimestamps));

            try {
                const response = await fetch("https://d63ojp7jad.execute-api.eu-west-1.amazonaws.com/prod/user/captcha");
                captchaId = response.headers.get("x-captcha-id");
                const blob = await response.blob();
                const captchaImage = document.getElementById("captchaImage");
                // Revoke old captcha if it exists:
                if (captchaImage.src && captchaImage.src.startsWith("blob:")) {
                    URL.revokeObjectURL(captchaImage.src);
                }
                captchaImage.src = URL.createObjectURL(blob);
            } catch (error) {
                console.error("Error loading captcha:", error);
            }
        }
    }
}

loadCaptcha(false);
document.getElementById("reloadCaptcha").addEventListener("click", loadCaptcha);


// ---- REGISTRATION --------------
const erroxBox = document.querySelector(".error-validation");
let isValidPassword = false

// Password validation:
document.querySelector('input[type="password"]').addEventListener("input", () => {
    const password = document.querySelector('input[type="password"]').value;
    if (password.length < 8) {
        erroxBox.textContent = "Password needs to have 8 or more characters";
    }
    else if (!(/\d/).test(password)) {
        erroxBox.textContent = "Password must include at least 1 number";
    }
    else if (!(/[A-Z]/).test(password)) {
        erroxBox.textContent = "Password must include at least 1 uppercase letter";
    }
    else {
        erroxBox.textContent = null;
        isValidPassword = true
    }
})

// Form submission:
document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isValidPassword) {
        return;
    }
    else {
        const formData = new FormData(e.target);
        const registrationData = {
            name: formData.get("username").trim().toLowerCase(),
            password: formData.get("password"),
            captcha_id: captchaId,
            captcha_answer: formData.get("captcha"),
            user_type: formData.get("user-type"),
        };
        try {
            const response = await fetch('https://d63ojp7jad.execute-api.eu-west-1.amazonaws.com/prod/user/register', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registrationData),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = {};
                }
                let alertMessage;
                if (response.status === 400) {
                    if (errorData.detail) {
                        if (typeof errorData.detail === "string") {
                            alertMessage = errorData.detail;
                        }
                    } else {
                        alertMessage = "Registration failed. Please check your input and try again.";
                    }
                } else {
                    alertMessage = "Something went wrong. Please try again later.";
                }
                const box = document.getElementById("error400");
                document.getElementById("error400-msg").textContent = alertMessage;
                box.showModal();
                return;
            } else {
                const box = document.getElementById("success");
                box.showModal();
                setTimeout(() => {
                    box.close();
                    window.location.href = "login.html";
                }, 3000);
            };
        } catch (error) {
            console.error('Network / Fetch error :', error);
            const box = document.getElementById("fetch-error");
            box.showModal();
        };
    }
});

// Uncheck slurp agreement attempt:
document.getElementById("agreement").addEventListener("change", e => {
    if (!e.target.checked) {
        const box = document.getElementById("uncheck");
        box.showModal();
        setTimeout(() => { e.target.checked = true; }, 1500)
    }
})

document.querySelectorAll("dialog").forEach(box => {
    box.addEventListener("click", e => {
        if (e.target === box) {
            box.close();
        }
    });
});

document.querySelectorAll(".closeButton").forEach(button => {
    button.addEventListener("click", (e) => {
        const dialog = e.target.closest("dialog");
        if (dialog) {
            dialog.close();
        }
    });
});