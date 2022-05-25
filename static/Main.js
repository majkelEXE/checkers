import Game from "./Game.js";
import Net from "./Net.js";
import Ui from "./Ui.js";

let game;
let net;
let ui;

window.onload = () => {
  game = new Game();
  net = new Net();
  ui = new Ui();
};

export { game, net, ui };
