// ---- CAPTCHA -------------------
let captchaId = ""
const loadCaptcha = async () => {
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
//loadCaptcha();
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
                pop(box);
                return;
            } else {
                const box = document.getElementById("success");
                pop(box);
                setTimeout(() => {
                    closeAlert(box);
                    window.location.href = "login.html";
                }, 3000);
            };
        } catch (error) {
            console.error('Network / Fetch error :', error);
            const box = document.getElementById("fetch-error");
            pop(box);
        };
    }
});

// Uncheck slurp agreement attempt:
document.getElementById("agreement").addEventListener("change", e => {
    if (!e.target.checked) {
        const box = document.getElementById("uncheck");
        pop(box);
        setTimeout(() => { e.target.checked = true; }, 1500)
    }
})


// Pop alerts:
const pop = (box) => {
    box.showModal();
}

// Close alerts:
const closeAlert = (box) => {
    box.close();
};

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