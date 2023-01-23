var express = require("express");
var app = express();
const PORT = process.env.PORT || 3000;
var path = require("path");
app.use(express.static("static"));
app.use(express.json());

var users = [];

var usedColors = [];

var currentTab = [
  [0, 2, 0, 2, 0, 2, 0, 2],
  [2, 0, 2, 0, 2, 0, 2, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0],
];

var movedObject;
var whoDidTheLastMove;

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/static/index.html"));
});

app.post("/uploadChanges", function (req, res) {
  console.log(req.body);

  whoDidTheLastMove = req.body.userColorWhoMoved;
  currentTab[req.body.previousRow][req.body.previousColumn] = 0;

  if (req.body.pieceType == "piece") {
    currentTab[req.body.actualRow][req.body.actualColumn] =
      req.body.pieceColor == "bialy" ? 1 : 2;
  } else if (req.body.pieceType == "queen") {
    currentTab[req.body.actualRow][req.body.actualColumn] =
      req.body.pieceColor == "bialy" ? 3 : 4;
  }

  // if (req.body.pieceColor == "bialy" && req.body.zbityName != undefined) {
  //   if (req.body.actualColumn - req.body.previousColumn > 0) {
  //     currentTab[req.body.actualRow + 1][req.body.actualColumn - 1] = 0;
  //   } else if (req.body.actualColumn - req.body.previousColumn < 0) {
  //     currentTab[req.body.actualRow + 1][req.body.actualColumn + 1] = 0;
  //   }
  // } else if (
  //   req.body.pieceColor == "czarny" &&
  //   req.body.zbityName != undefined
  // ) {
  //   if (req.body.actualColumn - req.body.previousColumn > 0) {
  //     currentTab[req.body.actualRow - 1][req.body.actualColumn - 1] = 0;
  //   } else if (req.body.actualColumn - req.body.previousColumn < 0) {
  //     currentTab[req.body.actualRow - 1][req.body.actualColumn + 1] = 0;
  //   }
  // }

  //dziala?

  //USUNIECIE ZBITEGO Z TABLICY
  if (req.body.zbityName != undefined) {
    currentTab[req.body.zbityX][req.body.zbityY] = 0;
  }

  if (
    req.body.pieceColor == "bialy" &&
    req.body.actualRow == 0 &&
    req.body.pieceType == "piece"
  ) {
    currentTab[req.body.actualRow][req.body.actualColumn] = 3;
  } else if (
    req.body.pieceColor == "czarny" &&
    req.body.actualRow == 7 &&
    req.body.pieceType == "piece"
  ) {
    currentTab[req.body.actualRow][req.body.actualColumn] = 4;
  }

  res.end(JSON.stringify({ currentArray: currentTab }));
  movedObject = req.body;
});

app.post("/listenForChanges", function (req, res) {
  if (movedObject != undefined && req.body.userColor != whoDidTheLastMove) {
    movedObject["currentArray"] = currentTab;
    res.end(JSON.stringify(movedObject, 5, null));
    movedObject = undefined;
  } else {
    res.end(
      JSON.stringify({ Message: "The move has not been done yet." }, 5, null)
    );
  }
});

app.post("/login", function (req, res) {
  let index = users.findIndex((user) => {
    return user.userName == req.body.data.user;
  });

  if (users.length < 2 && index == -1) {
    let _userColor;

    if (usedColors.length < 1) {
      _userColor = Math.round(Math.random() * (2 - 1) + 1);
    } else {
      if (usedColors.includes(1)) {
        _userColor = 2;
      } else if (usedColors.includes(2)) {
        _userColor = 1;
      }
    }
    usedColors.push(_userColor);

    users.push({ userName: req.body.data.user, userColor: _userColor });
    res.end(
      JSON.stringify(
        {
          userName: req.body.data.user,
          userColor: _userColor,
          usersCount: users.length,
          currentArray: currentTab,
          hisTurn: false,
        },
        5,
        null
      )
    );
  } else if (users.length == 2) {
    res.end(JSON.stringify({ errorMessage: "Nie ma wolnych miejsc" }, 5, null));
  } else if (index != -1) {
    res.end(
      JSON.stringify(
        { errorMessage: "Użytkownik z taką nazwą już istnieje" },
        5,
        null
      )
    );
  }
});

app.post("/reset", function (req, res) {
  users = [];
  usedColors = [];
  currentTab = [
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
  ];
  movedObject = undefined;
  res.end(JSON.stringify({ Message: "Game is reseted!" }, 5, null));
});

app.post("/checkIfSecondPlayerJoined", function (req, res) {
  if (users.length == 2) {
    res.end(
      JSON.stringify({ secondUser: users[1].userName, hisTurn: true }, 5, null)
    );
  } else {
    res.end(
      JSON.stringify({ Message: "Second player has not yet joined" }, 5, null)
    );
  }
});

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
