const createAvatarBtn = document.getElementById("add-avatar");
const video = document.getElementById("videoElement");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const startCam = document.getElementById("startCamera");
const shoot = document.getElementById("takePicture");
const stopCam = document.getElementById("stopCamera");
const usePic = document.getElementById("retrievePicture");
const sendBtn = document.getElementById("sendPicture");
const instructions = document.getElementById("picture-instructions");

const photoClean = () => {
    photo.src = ""
    photo.style.display = "none";
}

const init = () => {
    startCam.style.display = "block";
    shoot.style.display = "none";
    stopCam.style.display = "none";
    usePic.style.display = "none";
    sendBtn.style.display = "block";
    usePic.textContent = "Use picture";
    instructions.style.color = "#fff";
}

const showPopup = () => {
    createAvatarBtn.addEventListener("click", () => {
        document.querySelector(".overlay").classList.add("visible");
        document.querySelector('.box[data-box="camera"]').style.display = "flex";
        photoClean();
        init();
        popupBox.addEventListener("keydown", trapFocus);
        if (focusable.length) focusable[0].focus();
    })
};

const startCamera = () => {
    startCam.addEventListener("click", () => {
        photoClean();
        startCam.style.display = "none";
        shoot.style.display = "none";
        stopCam.style.display = "block";
        usePic.style.display = "none";
        usePic.textContent = "Download picture";
        instructions.style.color = "#fff";

        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
                video.play();
                shoot.style.display = "block";
                sendBtn.style.display = "none";
                instructions.classList.toggle("visible", false);
            })
            .catch((error) => {
                shoot.style.display = "none";
                startCam.style.display = "block";
                stopCam.style.display = "none";
                console.error("Error accessing the camera", error);
                instructions.classList.toggle("visible", true);
            });
    })
};

const stopStream = () => {
    const stream = video.srcObject;
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
};

const stopCamera = () => {
    stopCam.addEventListener("click", () => {
        stopStream();
        startCam.style.display = "block";
        shoot.style.display = "none";
        stopCam.style.display = "none";
    })
};

const takePicture = () => {
    shoot.addEventListener("click", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        photo.src = canvas.toDataURL("image/png");
        photo.style.display = "block";
        startCam.style.display = "block";
        stopCam.style.display = "none";
        shoot.style.display = "none";
        usePic.style.display = "block";
        instructions.innerHTML = "Do you like it? Click on the <span>Download</span> button above. Otherwise, you can take a new one!";
        instructions.style.color = "#e4a434";
        instructions.classList.toggle("visible", true);
        stopStream();
    })
};

const getPicture = () => {
    usePic.addEventListener("click", () => {
        const photoDataUrl = photo.src;
        if (!photoDataUrl) {
            alert("No photo taken yet!");
            return;
        } else {
            const link = document.createElement("a");
            link.href = photoDataUrl;
            link.download = "avatar.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => {
                usePic.style.display = "none";
                sendBtn.style.display = "block";
                instructions.innerHTML = "Now, <span>email us your picture</span> so we can work on it!";
                instructions.style.color = "#e4a434";
            }, 500);
        }
    });
};

const emailPicture = () => {
    const email = "helenetrafficker@gmail.com";
    const subject = encodeURIComponent("RelAppmidos Avatar request");
    const body = encodeURIComponent("Hi! Here's my avatar request.\n\nAvatar name: _ _ _ _ _ _\n\n--------------------------------------------\n👉 Don't forget to attach your picture to this email! 🔗\n--------------------------------------------");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
};

const sendPictureToDev = () => {
    sendBtn.addEventListener("click", () => {
        emailPicture();
    }
    )
};

const exit = () => {
    stopStream();
    photoClean();
    const box = document.querySelector(".box");
    box.style.display === "flex" ? (box.style.display = "none") : null
    const overlay = document.querySelector(".overlay");
    overlay.classList.remove("visible");
    instructions.classList.toggle("visible", false);
}

const exitPopupEvents = () => {
    document.querySelector(".closeButton").addEventListener("click", exit);
    document.querySelector(".overlay").addEventListener("click", exit)
};

// FOCUS MANAGEMENT (KEYBOARD NAVIGATION):
const popupBox = document.querySelector('.box[data-box="camera"]');
const focusable = popupBox.querySelectorAll("button");
if (focusable.length) focusable[0].focus();
const trapFocus = (e) => {
    if (e.key === "Escape") {
        popupBox.removeEventListener("keydown", trapFocus);
        exit();
        return;
    }
    else if (e.key !== "Tab" && e.key !== "Escape") return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
};

export default () => {
    showPopup();
    startCamera();
    stopCamera();
    takePicture();
    getPicture();
    sendPictureToDev();
    exitPopupEvents();
}