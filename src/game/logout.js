import { removeFromStorage } from "./utils.js";

export const logout = () => {
    const logoutButton = document.getElementById("logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            removeFromStorage("loggedInUser", "authCredentials");
            window.location.href = "login.html";
        });
    }
};