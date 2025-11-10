const url = "https://7klega2ek2.execute-api.eu-west-1.amazonaws.com/prod";

// ---- LOGIN ---------------------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const enteredEmail = formData.get("email").trim().toLowerCase();
    const enteredPassword = formData.get("password");
    try {
        const response = await fetch(`${url}/user/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: enteredEmail,
                password: enteredPassword
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                const box = document.getElementById("error400");
                box.showModal();
                return;
            }
            throw new Error(`Login request failed: ${response.statusText}`);
        }
        const data = await response.json();
        const token = data.access_token;
        if (!token) {
            throw new Error("No token received from server");
        }
        localStorage.setItem("access_token", token);
        window.location.href = "index.html";
    } catch (error) {
        console.error('Network / Fetch error :', error.message);
        const box = document.getElementById("fetch-error");
        box.showModal();
    }
});

// ---- GOOGLE LOGIN --------------
// window.handleGoogleLogin = async (response) => {
//     const res = await fetch(`${url}/google/auth`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ credential: response.credential })
//     });
//     showOutput(await res.json());
//     localStorage.setItem("access_token", response.credential);
//     console.log(response.credential);
//     window.location.href = "index.html";
// };

// ---- CLOSING ALERTS ------------
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