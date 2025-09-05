const initTimedBackground = () => {
  // ---- DYNAMIC BACKGROUND DEPENDING ON TIME ----------------------------
  const now = new Date();
  const hour = now.getHours();
  let dynamicBackgroundImg;
  let backgroundFolder;
  if (window.matchMedia("(max-width: 600px)").matches) {
    backgroundFolder = "mobile";
  }
  else { backgroundFolder = "desktop"; }
  if (hour >= 5 && hour < 7) {
    dynamicBackgroundImg = `url(assets/img/${backgroundFolder}/early_morning.webp)`;
  }
  else if (hour >= 7 && hour < 11) {
    dynamicBackgroundImg = `url(assets/img/${backgroundFolder}/morning.webp)`;
  }
  else if (hour >= 11 && hour < 19) {
    dynamicBackgroundImg = `url(assets/img/${backgroundFolder}/day.webp)`;
  }
  else if (hour >= 19 && hour < 21) {
    dynamicBackgroundImg = `url(assets/img/${backgroundFolder}/sunset.webp)`;
  }
  else {
    dynamicBackgroundImg = `url(assets/img/${backgroundFolder}/night.webp)`;
  }
  if (window.matchMedia("(max-width: 600px)").matches) {
    document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.45)), ${dynamicBackgroundImg}`
  }
  else {
    document.body.style.backgroundImage = `${dynamicBackgroundImg}`
  }
}

export default initTimedBackground;