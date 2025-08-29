import addAvatar from "./game/add-avatar.js";
import startGame from "./game/index.js";
import { logout } from "./game/logout.js";
import initTimedBackground from "./game/timed-background.js";

initTimedBackground();
startGame();
logout();
addAvatar();