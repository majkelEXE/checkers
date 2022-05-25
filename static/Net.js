import { ui, game } from "./Main.js";

class Net {
  // function fetchPost() {

  login = async (userName) => {
    const body = JSON.stringify({
      data: {
        user: userName,
      },
    }); // body czyli przesyłane na serwer dane

    const headers = { "Content-Type": "application/json" }; // nagłowek czyli typ danych

    let response = await fetch("/login", { method: "post", body, headers }); // fetch

    if (!response.ok) return response.status;
    else return await response.json();
  };

  reset = async () => {
    const headers = { "Content-Type": "application/json" }; // nagłowek czyli typ danych

    let response = await fetch("/reset", { method: "post", headers }); // fetch

    if (!response.ok) return response.status;
    else return await response.json();
  };

  checkIfUserJoined = async () => {
    const headers = { "Content-Type": "application/json" }; // nagłowek czyli typ danych

    let response = await fetch("/checkIfSecondPlayerJoined", {
      method: "post",
      headers,
    }); // fetch

    if (!response.ok) return response.status;
    else return await response.json();
  };

  uploadChanges = async (
    aRow,
    pRow,
    aColumn,
    pColumn,
    pColor,
    pName,
    pType,
    _zbity,
    _zbityX,
    _zbityY
  ) => {
    const headers = { "Content-Type": "application/json" }; // nagłowek czyli typ danych

    const body = JSON.stringify({
      actualRow: aRow,
      previousRow: pRow,
      actualColumn: aColumn,
      previousColumn: pColumn,
      pieceColor: pColor,
      pieceName: pName,
      pieceType: pType,
      zbityName: _zbity,
      zbityX: _zbityX,
      zbityY: _zbityY,
      userColorWhoMoved: game.colorPionkowUsera,
    });

    let response = await fetch("/uploadChanges", {
      method: "post",
      body,
      headers,
    }); // fetch

    if (!response.ok) return response.status;
    else return await response.json();
  };

  listenForChanges = async () => {
    const headers = { "Content-Type": "application/json" }; // nagłowek czyli typ danych

    const body = JSON.stringify({
      userColor: game.colorPionkowUsera,
    });

    let response = await fetch("/listenForChanges", {
      method: "post",
      body,
      headers,
    }); // fetch

    if (!response.ok) return response.status;
    else return await response.json();
  };

  startListeningForChanges = () => {
    let timeCounter = 60;
    ui.updateTimeLeftForUser(true, Math.round(timeCounter / 2));
    this.changesInterval = setInterval(async () => {
      let info = await this.listenForChanges();
      timeCounter--;
      ui.updateTimeLeftForUser(true, Math.ceil(timeCounter / 2));
      if (timeCounter == 0) {
        clearInterval(this.changesInterval);
        ui.infoAboutWinningOrLosing(
          true,
          "Przeciwnik nie wykonał ruchu we wskazanym czasie"
        );
        //this.stopListeningForChanges("timeLeft", info);
      } else if (info.hasOwnProperty("actualRow")) {
        clearInterval(this.changesInterval);
        ui.updateTimeLeftForUser(false, 30);
        game.updateGameBoard(
          info.actualRow,
          info.actualColumn,
          info.pieceName,
          info.pieceType,
          info.currentArray,
          info.zbityName
        );
        //this.stopListeningForChanges("gotFeedback", info);
        // return info;
      }
    }, 500);
  };

  // stopListeningForChanges = (typeOfRespond, respond) => {
  //   clearInterval(this.changesInterval);

  //   switch (typeOfRespond) {
  //     case "timeLeft":
  //       break;
  //     case "gotFeedback":
  //       break;
  //   }
  // };

  // }
}

export default Net;
