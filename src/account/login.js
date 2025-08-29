// ---- LOGIN ---------------------
document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const enteredName = formData.get("username").trim().toLowerCase();
    const enteredPassword = formData.get("password");
    try {
        const credentials = btoa(`${enteredName}:${enteredPassword}`);
        const response = await fetch(
            "https://d63ojp7jad.execute-api.eu-west-1.amazonaws.com/prod/user/users",
            {
                headers: {
                    "Authorization": `Basic ${credentials}`
                }
            }
        );
        if (!response.ok) {
            if (response.status === 401) {
                alert("Invalid username or password.");
                return;
            }
            throw new Error(`Login request failed: ${response.statusText}`);
        }
        localStorage.setItem("authCredentials", credentials);
        localStorage.setItem("loggedInUser", enteredName);
        window.location.href = "index.html";
    } catch (error) {
        alert("Error during login: " + error.message);
    }
});

// ---- GUEST ACCESS TO PIXIE -----
document.getElementById("play-as-guest").addEventListener("click", () => {
    localStorage.setItem("loggedInUser", "pixie");
    window.location.href = "index.html";
});