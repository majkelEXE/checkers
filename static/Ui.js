import { net, game } from "./Main.js";

class Ui {
  constructor() {
    this.hisTurn = false;
    //

    window.addEventListener("resize", game.onWindowResize, false);

    //
    document.getElementById("btnLogin").addEventListener("click", async (e) => {
      let data = await net.login(document.getElementById("userName").value);

      if (data.hasOwnProperty("userName")) {
        document.getElementById(
          "navbar"
        ).innerHTML = `<div>USER_ADDED</div><div>Welcome <span style="font-weight: bold; color: green;">${
          data.userName
        }</span>, your pieces are ${
          data.userColor == 1 ? "white" : "black"
        }</div>`;

        game.loadPiece(data.userColor);

        if (data.usersCount == 1) {
          var waitingForSecondUser = setInterval(async () => {
            let info = await net.checkIfUserJoined();

            if (info.hasOwnProperty("secondUser")) {
              clearInterval(waitingForSecondUser);
              this.hisTurn = info.hisTurn;
              document.getElementById("loginDialog").style.display = "none";
              document.getElementById(
                "navbar"
              ).innerHTML += `<div>Przeciwny gracz to <span style="font-weight: bold; color: green;">${info.secondUser}</span></div>`;
              game.raycasterWorking();
              game.countDownOwnTime();
            } else {
              document.getElementById("loginDialog").innerHTML =
                "WAITING FOR THE SECOND PLAYER...";
            }
          }, 500);
        } else {
          // this.hisTurn = data.hisTurn;
          document.getElementById("loginDialog").style.display = "none";
          game.raycasterWorking();
          net.startListeningForChanges();
        }
        this.updateCurrentArrayDisplay(
          data.currentArray,
          data.userColor == 1 ? "bialy" : "czarny"
        );
        document.getElementById("mainWaitingDialogInfo").innerHTML =
          "Enemy's turn...";
      } else {
        alert(data.errorMessage);
      }
    });

    //

    document.getElementById("btnReset").addEventListener("click", async (e) => {
      let data = await net.reset();

      // if (data.hasOwnProperty("Message")) {
      //   alert(data.Message);
      // }
    });

    //

    document
      .getElementById("restartGameBtnContainer")
      .addEventListener("click", async (e) => {
        let data = await net.reset();
        location.reload();
      });
  }

  updateCurrentArrayDisplay = (currentArray, userColor) => {
    document.getElementById("currentArray").innerHTML = "";

    document.getElementById("currentArray").style.display = "block";
    //

    if (userColor == "bialy") {
      currentArray.forEach((row) => {
        row.forEach((cell, i) => {
          if (i == 7) {
            document.getElementById("currentArray").innerHTML += cell;
          } else {
            document.getElementById("currentArray").innerHTML += cell + " ";
          }
        });
        document.getElementById("currentArray").innerHTML += "<br />";
      });
    } else if (userColor == "czarny") {
      currentArray
        .slice()
        .reverse()
        .forEach((row) => {
          row
            .slice()
            .reverse()
            .forEach((cell, i) => {
              if (i == 7) {
                document.getElementById("currentArray").innerHTML += cell;
              } else {
                document.getElementById("currentArray").innerHTML += cell + " ";
              }
            });
          document.getElementById("currentArray").innerHTML += "<br />";
        });
    }
  };

  updateTimeLeftForUser = (isWorking, time) => {
    if (isWorking) {
      document.getElementById("waitingDialog").style.display = "flex";
      document.getElementById("enemyTimeCounter").innerHTML = time;
    } else {
      document.getElementById("waitingDialog").style.display = "none";
    }
  };

  updateTimeLeftForMakeMove = (isWorking, time) => {
    if (isWorking) {
      document.getElementById("timeDialog").style.display = "flex";
      document.getElementById("timeDialog").innerHTML = time;
    } else {
      document.getElementById("timeDialog").style.display = "none";
    }
  };

  infoAboutWinningOrLosing = (win, textContent) => {
    document.getElementById("waitingDialog").style.display = "flex";
    if (win) {
      document.getElementById("mainWaitingDialogInfo").innerHTML =
        "Wygrałeś!!!";
    } else {
      document.getElementById("mainWaitingDialogInfo").innerHTML =
        "Przegrałeś!!!";
    }
    document.getElementById("enemyTimeCounter").innerHTML = textContent;

    this.hisTurn = false;
    document.getElementById("restartGameBtnContainer").style.display = "flex";
  };
}

export default Ui;
