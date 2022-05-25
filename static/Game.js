import "./libs/three.js";
import { game, net, ui } from "./Main.js";

import Pionek from "./Pionek.js";
import Item from "./Item.js";
import Krolowa from "./Krolowa.js";

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.set(0, 100, 300);
    this.camera.lookAt(this.scene.position);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xb5a3a4);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("root").append(this.renderer.domElement);

    this.axes = new THREE.AxesHelper(1000);
    this.scene.add(this.axes);

    this.szachownica = [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
    ];
    //15 + 30 + 30 + 30 = 105

    this.pionki = [
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
    ];

    this.piecesObjects = [];
    this.itemsObjects = [[], [], [], [], [], [], [], []];
    this.idWhiteQueen = 0;
    this.idBlackQueen = 0;

    this.whitePoints = 0;
    this.blackPoints = 0;
    // ---> Y
    //  ^
    //  |
    //  | X

    this.zPos = 105;
    this.xPos = 105;

    var itemsCounter = 0;

    for (let i = 0; i < this.szachownica.length; i++) {
      for (let j = 0; j < this.szachownica[i].length; j++) {
        let clone;

        if (this.szachownica[i][j] == 1) {
          clone = new Item(true, itemsCounter);
        } else if (this.szachownica[i][j] == 0) {
          clone = new Item(false, itemsCounter);
        }

        this.scene.add(clone);
        clone.position.set(this.xPos, 0, this.zPos);

        clone.x = i;
        clone.y = j;

        this.itemsObjects[i][j] = clone;

        itemsCounter++;
        this.xPos -= 30;
      }

      this.zPos -= 30;
      this.xPos = 105;
    }

    this.render(); // wywołanie metody render
  }

  loadPiece = (colorPiece) => {
    if (colorPiece == 2) {
      this.camera.position.set(0, 100, 300);
      this.camera.lookAt(this.scene.position);
      this.colorPionkowUsera = "czarny";
    } else if (colorPiece == 1) {
      this.camera.position.set(0, 100, -300);
      this.camera.lookAt(this.scene.position);
      this.colorPionkowUsera = "bialy";
    }

    this.zPos = 105;
    this.xPos = 105;

    let counterOfWhitePiece = 0;
    let counterOfBlackPiece = 0;

    for (let i = 0; i < this.szachownica.length; i++) {
      for (let j = 0; j < this.szachownica[i].length; j++) {
        let clonePiece;

        if (this.pionki[i][j] == 1) {
          clonePiece = new Pionek(true, counterOfWhitePiece);
          counterOfWhitePiece++;
        } else if (this.pionki[i][j] == 2) {
          clonePiece = new Pionek(false, counterOfBlackPiece);
          counterOfBlackPiece++;
        }

        if (clonePiece != undefined) {
          this.scene.add(clonePiece);
          this.piecesObjects.push(clonePiece);
          clonePiece.position.set(this.xPos, 10, this.zPos);
          clonePiece.x = i;
          clonePiece.y = j;
        }

        this.xPos -= 30;
      }

      this.zPos -= 30;
      this.xPos = 105;
    }
  };

  render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
  };

  raycasterWorking = () => {
    var selected;
    var possibleMovesItems = [];
    var possibleMovesQueen = [];

    window.addEventListener("mousedown", (event) => {
      const raycaster = new THREE.Raycaster(); // obiekt Raycastera symulujący "rzucanie" promieni
      const mouseVector = new THREE.Vector2();
      mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouseVector, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children);

      if (intersects.length > 0) {
        console.log(intersects[0].object);

        //LOGIKA PIONKA
        if (
          ui.hisTurn &&
          selected == undefined &&
          intersects[0].object.elementType == "piece" &&
          intersects[0].object.kolor == this.colorPionkowUsera
        ) {
          selected = intersects[0].object;
          //selected.material.color.set(0xf7e8bc);
          selected.material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load("textures/selectedPiece.jpg"),
          });

          this.polozenieX = selected.x;
          this.polozenieY = selected.y;

          //NOWY SYSTEM PORUSZANIA SIE - PODSWIETLANIE
          //
          //BIALY
          if (
            this.colorPionkowUsera == "bialy" &&
            this.polozenieX < this.pionki.length &&
            this.polozenieX > 0
          ) {
            //CZY OD LEWEJ MA ODSTEP
            if (
              this.polozenieY > 0 &&
              this.szachownica[this.polozenieX - 1][this.polozenieY - 1] == 0 &&
              this.pionki[this.polozenieX - 1][this.polozenieY - 1] == 0
            ) {
              let possibleItem =
                this.itemsObjects[this.polozenieX - 1][this.polozenieY - 1];

              //possibleItem.material.color.set(0x00ff1f);
              possibleItem.material = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(
                  "textures/selectedBlock.jpg"
                ),
              });

              possibleMovesItems.push({
                item: possibleItem,
                zbity: undefined,
              });
            }
            //CZY OD PRAWEJ MA ODSTEP
            if (
              this.polozenieY < this.pionki[0].length - 1 &&
              this.szachownica[this.polozenieX - 1][this.polozenieY + 1] == 0 &&
              this.pionki[this.polozenieX - 1][this.polozenieY + 1] == 0
            ) {
              let possibleItem =
                this.itemsObjects[this.polozenieX - 1][this.polozenieY + 1];

              //possibleItem.material.color.set(0x00ff1f);
              possibleItem.material = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(
                  "textures/selectedBlock.jpg"
                ),
              });

              possibleMovesItems.push({
                item: possibleItem,
                zbity: undefined,
              });
            }

            //CZY MA PIONKA PO LEWO I WOLNE MIEJSCE

            if (
              this.polozenieX - 2 >= 0 &&
              this.polozenieX - 2 < this.pionki.length &&
              this.polozenieY - 2 >= 0 &&
              this.polozenieY - 2 < this.pionki.length
            ) {
              if (
                this.polozenieY > 1 &&
                this.szachownica[this.polozenieX - 2][this.polozenieY - 2] ==
                  0 &&
                this.pionki[this.polozenieX - 2][this.polozenieY - 2] == 0 &&
                (this.pionki[this.polozenieX - 1][this.polozenieY - 1] == 2 ||
                  this.pionki[this.polozenieX - 1][this.polozenieY - 1] == 4)
              ) {
                let possibleItem =
                  this.itemsObjects[this.polozenieX - 2][this.polozenieY - 2];

                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                var zbityPiece = this.piecesObjects.filter((piece) => {
                  return (
                    piece.x == this.polozenieX - 1 &&
                    piece.y == this.polozenieY - 1
                  );
                })[0];

                possibleMovesItems.push({
                  item: possibleItem,
                  zbity: zbityPiece,
                });
              }
            }

            //CZY MA PIONKA PO PRAWOOO I WOLNE MIEJSCE
            if (
              this.polozenieX - 2 >= 0 &&
              this.polozenieX - 2 < this.pionki.length &&
              this.polozenieY + 2 >= 0 &&
              this.polozenieY + 2 < this.pionki.length
            ) {
              if (
                this.polozenieY < this.pionki[0].length - 2 &&
                this.szachownica[this.polozenieX - 2][this.polozenieY + 2] ==
                  0 &&
                this.pionki[this.polozenieX - 2][this.polozenieY + 2] == 0 &&
                (this.pionki[this.polozenieX - 1][this.polozenieY + 1] == 2 ||
                  this.pionki[this.polozenieX - 1][this.polozenieY + 1] == 4)
              ) {
                let possibleItem =
                  this.itemsObjects[this.polozenieX - 2][this.polozenieY + 2];

                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                var zbityPiece = this.piecesObjects.filter((piece) => {
                  return (
                    piece.x == this.polozenieX - 1 &&
                    piece.y == this.polozenieY + 1
                  );
                })[0];

                possibleMovesItems.push({
                  item: possibleItem,
                  zbity: zbityPiece,
                });
              }
            }
            //CZARNY
            //
          } else if (
            this.colorPionkowUsera == "czarny" &&
            this.polozenieX < this.pionki.length - 1 &&
            this.polozenieX >= 0
          ) {
            //CZY OD LEWEJ MA ODSTEP
            if (
              this.polozenieY > 0 &&
              this.szachownica[this.polozenieX + 1][this.polozenieY - 1] == 0 &&
              this.pionki[this.polozenieX + 1][this.polozenieY - 1] == 0
            ) {
              let possibleItem =
                this.itemsObjects[this.polozenieX + 1][this.polozenieY - 1];

              //possibleItem.material.color.set(0x00ff1f);
              possibleItem.material = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(
                  "textures/selectedBlock.jpg"
                ),
              });

              possibleMovesItems.push({
                item: possibleItem,
                zbity: undefined,
              });
            }
            //CZY OD PRAWEJ MA ODSTEP
            if (
              this.polozenieY < this.pionki[0].length - 1 &&
              this.szachownica[this.polozenieX + 1][this.polozenieY + 1] == 0 &&
              this.pionki[this.polozenieX + 1][this.polozenieY + 1] == 0
            ) {
              let possibleItem =
                this.itemsObjects[this.polozenieX + 1][this.polozenieY + 1];

              //possibleItem.material.color.set(0x00ff1f);
              possibleItem.material = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load(
                  "textures/selectedBlock.jpg"
                ),
              });

              possibleMovesItems.push({
                item: possibleItem,
                zbity: undefined,
              });
            }
            //CZY MA PIONKA PO LEWO I WOLNE MIEJSCE
            if (
              this.polozenieX + 2 >= 0 &&
              this.polozenieX + 2 < this.pionki.length &&
              this.polozenieY - 2 >= 0 &&
              this.polozenieY - 2 < this.pionki.length
            ) {
              if (
                this.polozenieY > 1 &&
                this.szachownica[this.polozenieX + 2][this.polozenieY - 2] ==
                  0 &&
                this.pionki[this.polozenieX + 2][this.polozenieY - 2] == 0 &&
                (this.pionki[this.polozenieX + 1][this.polozenieY - 1] == 1 ||
                  this.pionki[this.polozenieX + 1][this.polozenieY - 1] == 3)
              ) {
                let possibleItem =
                  this.itemsObjects[this.polozenieX + 2][this.polozenieY - 2];

                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                var zbityPiece = this.piecesObjects.filter((piece) => {
                  return (
                    piece.x == this.polozenieX + 1 &&
                    piece.y == this.polozenieY - 1
                  );
                })[0];

                possibleMovesItems.push({
                  item: possibleItem,
                  zbity: zbityPiece,
                });
              }
            }

            //CZY MA PIONKA PO PRAWOOO I WOLNE MIEJSCE
            if (
              this.polozenieX + 2 >= 0 &&
              this.polozenieX + 2 < this.pionki.length &&
              this.polozenieY + 2 >= 0 &&
              this.polozenieY + 2 < this.pionki.length
            ) {
              if (
                this.polozenieY < this.pionki[0].length - 2 &&
                this.szachownica[this.polozenieX + 2][this.polozenieY + 2] ==
                  0 &&
                this.pionki[this.polozenieX + 2][this.polozenieY + 2] == 0 &&
                (this.pionki[this.polozenieX + 1][this.polozenieY + 1] == 1 ||
                  this.pionki[this.polozenieX + 1][this.polozenieY + 1] == 3)
              ) {
                let possibleItem =
                  this.itemsObjects[this.polozenieX + 2][this.polozenieY + 2];

                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                var zbityPiece = this.piecesObjects.filter((piece) => {
                  return (
                    piece.x == this.polozenieX + 1 &&
                    piece.y == this.polozenieY + 1
                  );
                })[0];

                possibleMovesItems.push({
                  item: possibleItem,
                  zbity: zbityPiece,
                });
              }
            }
          }
          //LOGIKA KROLOWEJ
        } else if (
          ui.hisTurn &&
          selected == undefined &&
          intersects[0].object.elementType == "queen" &&
          intersects[0].object.kolor == this.colorPionkowUsera
        ) {
          selected = intersects[0].object;
          //selected.material.color.set(0xf7e8bc);
          selected.material = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load("textures/selectedPiece.jpg"),
          });

          this.polozenieX = selected.x;
          this.polozenieY = selected.y;

          //DIFFERENT THAN OUR COLOR IS THE COLOR
          let enemyColor = this.colorPionkowUsera == "bialy" ? [2, 4] : [1, 3];
          let ownColor = this.colorPionkowUsera == "bialy" ? [1, 3] : [2, 4];

          //PIERWSZA CWIARTKA
          let x1 = 1;
          let y1 = 1;

          //znalezionyKtosDoBicia w jednej linii
          let pieceToBeat_First = 0;
          let pieceToBeat_Second = 0;
          let pieceToBeat_Third = 0;
          let pieceToBeat_Fourth = 0;

          //tablice ruchow bez bicia w jednej lini
          let movesFirstPart_notBeating = { items: [], zbity: undefined };
          let movesSecondPart_notBeating = { items: [], zbity: undefined };
          let movesThirdPart_notBeating = { items: [], zbity: undefined };
          let movesFourthPart_notBeating = { items: [], zbity: undefined };
          //tablice ruchow z biciem w jednej lini
          let movesFirstPart_Beating = { items: [], zbity: undefined };
          let movesSecondPart_Beating = { items: [], zbity: undefined };
          let movesThirdPart_Beating = { items: [], zbity: undefined };
          let movesFourthPart_Beating = { items: [], zbity: undefined };

          for (let polaNaUkos = 0; polaNaUkos < 7; polaNaUkos++) {
            //PIERWSZA
            let possibleItem;
            if (
              this.polozenieX + x1 < 8 &&
              this.polozenieY + y1 < 8 &&
              pieceToBeat_First < 2
            ) {
              if (
                enemyColor.includes(
                  this.pionki[this.polozenieX + x1][this.polozenieY + y1]
                ) &&
                pieceToBeat_First < 1
              ) {
                var pieceToBeat = this.piecesObjects.filter(
                  (piece) =>
                    piece.x == this.polozenieX + x1 &&
                    piece.y == this.polozenieY + y1
                )[0];
                movesFirstPart_Beating.zbity = pieceToBeat;
                pieceToBeat_First++;
              } else if (
                ownColor.includes(
                  this.pionki[this.polozenieX + x1][this.polozenieY + y1]
                ) ||
                (enemyColor.includes(
                  this.pionki[this.polozenieX + x1][this.polozenieY + y1]
                ) &&
                  pieceToBeat_First == 1)
              ) {
                pieceToBeat_First += 2;
              } else {
                possibleItem =
                  this.itemsObjects[this.polozenieX + x1][this.polozenieY + y1];
                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                if (pieceToBeat_First == 0) {
                  movesFirstPart_notBeating.items.push(possibleItem);
                } else if (pieceToBeat_First == 1) {
                  movesFirstPart_Beating.items.push(possibleItem);
                }
              }
            }

            //DRUGA
            if (
              this.polozenieX + x1 < 8 &&
              this.polozenieY - y1 >= 0 &&
              pieceToBeat_Second < 2
            ) {
              if (
                enemyColor.includes(
                  this.pionki[this.polozenieX + x1][this.polozenieY - y1]
                ) &&
                pieceToBeat_Second < 1
              ) {
                var pieceToBeat = this.piecesObjects.filter(
                  (piece) =>
                    piece.x == this.polozenieX + x1 &&
                    piece.y == this.polozenieY - y1
                )[0];
                movesSecondPart_Beating.zbity = pieceToBeat;
                pieceToBeat_Second++;
              } else if (
                ownColor.includes(
                  this.pionki[this.polozenieX + x1][this.polozenieY - y1]
                ) ||
                (enemyColor.includes(
                  this.pionki[this.polozenieX + x1][this.polozenieY - y1]
                ) &&
                  pieceToBeat_Second == 1)
              ) {
                pieceToBeat_Second += 2;
              } else {
                possibleItem =
                  this.itemsObjects[this.polozenieX + x1][this.polozenieY - y1];
                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                if (pieceToBeat_Second == 0) {
                  movesSecondPart_notBeating.items.push(possibleItem);
                } else if (pieceToBeat_Second == 1) {
                  movesSecondPart_Beating.items.push(possibleItem);
                }
              }
            }
            //TRZECIA
            if (
              this.polozenieX - x1 >= 0 &&
              this.polozenieY - y1 >= 0 &&
              pieceToBeat_Third < 2
            ) {
              if (
                enemyColor.includes(
                  this.pionki[this.polozenieX - x1][this.polozenieY - y1]
                ) &&
                pieceToBeat_Third < 1
              ) {
                var pieceToBeat = this.piecesObjects.filter(
                  (piece) =>
                    piece.x == this.polozenieX - x1 &&
                    piece.y == this.polozenieY - y1
                )[0];
                movesThirdPart_Beating.zbity = pieceToBeat;
                pieceToBeat_Third++;
              } else if (
                ownColor.includes(
                  this.pionki[this.polozenieX - x1][this.polozenieY - y1]
                ) ||
                (enemyColor.includes(
                  this.pionki[this.polozenieX - x1][this.polozenieY - y1]
                ) &&
                  pieceToBeat_Third == 1)
              ) {
                pieceToBeat_Third += 2;
              } else {
                possibleItem =
                  this.itemsObjects[this.polozenieX - x1][this.polozenieY - y1];
                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                if (pieceToBeat_Third == 0) {
                  movesThirdPart_notBeating.items.push(possibleItem);
                } else if (pieceToBeat_Third == 1) {
                  movesThirdPart_Beating.items.push(possibleItem);
                }
              }
            }

            //CZWARTA
            if (
              this.polozenieX - x1 >= 0 &&
              this.polozenieY + y1 < 8 &&
              pieceToBeat_Fourth < 2
            ) {
              if (
                enemyColor.includes(
                  this.pionki[this.polozenieX - x1][this.polozenieY + y1]
                ) &&
                pieceToBeat_Fourth < 1
              ) {
                var pieceToBeat = this.piecesObjects.filter(
                  (piece) =>
                    piece.x == this.polozenieX - x1 &&
                    piece.y == this.polozenieY + y1
                )[0];
                movesFourthPart_Beating.zbity = pieceToBeat;
                pieceToBeat_Fourth++;
              } else if (
                ownColor.includes(
                  this.pionki[this.polozenieX - x1][this.polozenieY + y1]
                ) ||
                (enemyColor.includes(
                  this.pionki[this.polozenieX - x1][this.polozenieY + y1]
                ) &&
                  pieceToBeat_Fourth == 1)
              ) {
                pieceToBeat_Fourth += 2;
              } else {
                possibleItem =
                  this.itemsObjects[this.polozenieX - x1][this.polozenieY + y1];
                //possibleItem.material.color.set(0x00ff1f);
                possibleItem.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/selectedBlock.jpg"
                  ),
                });

                if (pieceToBeat_Fourth == 0) {
                  movesFourthPart_notBeating.items.push(possibleItem);
                } else if (pieceToBeat_Fourth == 1) {
                  movesFourthPart_Beating.items.push(possibleItem);
                }
              }
            }

            //
            x1++;
            y1++;
          }

          possibleMovesQueen.push(movesFirstPart_Beating);
          possibleMovesQueen.push(movesFirstPart_notBeating);
          possibleMovesQueen.push(movesSecondPart_Beating);
          possibleMovesQueen.push(movesSecondPart_notBeating);
          possibleMovesQueen.push(movesThirdPart_Beating);
          possibleMovesQueen.push(movesThirdPart_notBeating);
          possibleMovesQueen.push(movesFourthPart_Beating);
          possibleMovesQueen.push(movesFourthPart_notBeating);

          //RUCH PIONKA
        } else if (
          possibleMovesItems.filter((obj) => {
            return obj.item.name == intersects[0].object.name;
          }).length != 0
        ) {
          clearInterval(this.ownTime);
          ui.updateTimeLeftForMakeMove(false, 30);

          possibleMovesItems.forEach((obj) => {
            obj.item.setNotSelectedColor();
          });

          //ANIMACJA
          new TWEEN.Tween(selected.position) // co
            .to(
              {
                x: intersects[0].object.position.x,
                z: intersects[0].object.position.z,
              },
              500
            ) // do jakiej pozycji, w jakim czasie
            .repeat(0) // liczba powtórzeń
            .easing(TWEEN.Easing.Quadratic.In) // typ easingu (zmiana w czasie)
            .onUpdate(() => {})
            .onComplete(async () => {
              this.pionki[selected.x][selected.y] = 0;

              if (selected.kolor == "bialy") {
                this.pionki[intersects[0].object.x][intersects[0].object.y] = 1;
              } else if (selected.kolor == "czarny") {
                this.pionki[intersects[0].object.x][intersects[0].object.y] = 2;
              }

              //wziecie ruchu(pole + zbity pionek):
              var possibleMoveCombination = possibleMovesItems.filter((obj) => {
                return obj.item.name == intersects[0].object.name;
              })[0];

              var zbityName = undefined;
              var zbityX = undefined;
              var zbityY = undefined;
              //USUNIECIE ZBITEGO
              if (possibleMoveCombination.zbity != undefined) {
                zbityName = possibleMoveCombination.zbity.name;
                zbityX = possibleMoveCombination.zbity.x;
                zbityY = possibleMoveCombination.zbity.y;
                this.pionki[possibleMoveCombination.zbity.x][
                  possibleMoveCombination.zbity.y
                ] = 0;
                this.scene.remove(possibleMoveCombination.zbity);
                this.piecesObjects = this.piecesObjects.filter(
                  (piece) => piece.name != zbityName
                );

                if (possibleMoveCombination.zbity.kolor == "bialy") {
                  this.blackPoints++;
                } else if (possibleMoveCombination.zbity.kolor == "czarny") {
                  this.whitePoints++;
                }
              }

              let returnedObject = await net.uploadChanges(
                intersects[0].object.x,
                selected.x,
                intersects[0].object.y,
                selected.y,
                selected.kolor,
                selected.name,
                "piece",
                zbityName,
                zbityX,
                zbityY
              );

              ui.updateCurrentArrayDisplay(
                returnedObject.currentArray,
                this.colorPionkowUsera
              );

              selected.x = intersects[0].object.x;
              selected.y = intersects[0].object.y;

              selected.setNotSelectedColor();

              //UTWORZENIE KROLOWEJ W MIEJSCU TAMTEGO PIONKA, KTORY DOSZEDL DO KONCA
              if (this.colorPionkowUsera == "bialy" && selected.x == 0) {
                let queen = new Krolowa(true, this.idWhiteQueen);
                this.scene.remove(selected);
                queen.position.set(
                  selected.position.x,
                  20,
                  selected.position.z
                );
                queen.x = selected.x;
                queen.y = selected.y;
                this.scene.add(queen);
                this.pionki[intersects[0].object.x][intersects[0].object.y] = 3;
                this.idWhiteQueen++;

                //czyszczenie po starym pionku
                this.piecesObjects = this.piecesObjects.filter(
                  (piece) => piece.name != selected.name
                );

                this.piecesObjects.push(queen);
              } else if (
                this.colorPionkowUsera == "czarny" &&
                selected.x == this.szachownica.length - 1
              ) {
                let queen = new Krolowa(false, this.idBlackQueen);
                this.scene.remove(selected);
                queen.position.set(
                  selected.position.x,
                  20,
                  selected.position.z
                );
                queen.x = selected.x;
                queen.y = selected.y;
                this.scene.add(queen);
                this.pionki[intersects[0].object.x][intersects[0].object.y] = 4;
                this.idBlackQueen++;

                //czyszczenie po starym pionku
                this.piecesObjects = this.piecesObjects.filter(
                  (piece) => piece.name != selected.name
                );

                this.piecesObjects.push(queen);
              }

              selected = undefined;
              possibleMovesItems = [];
              ui.hisTurn = false;

              if (this.whitePoints == 8) {
                if (this.colorPionkowUsera == "bialy") {
                  ui.infoAboutWinningOrLosing(
                    true,
                    "Zbiłeś wszystkie pionki przeciwnika!"
                  );
                } else if (this.colorPionkowUsera == "czarny") {
                  ui.infoAboutWinningOrLosing(
                    false,
                    "Wszystkie twoje pionki zostały zbite!"
                  );
                }
              } else if (this.blackPoints == 8) {
                if (this.colorPionkowUsera == "bialy") {
                  ui.infoAboutWinningOrLosing(
                    false,
                    "Wszystkie twoje pionki zostały zbite!"
                  );
                } else if (this.colorPionkowUsera == "czarny") {
                  ui.infoAboutWinningOrLosing(
                    true,
                    "Zbiłeś wszystkie pionki przeciwnika!"
                  );
                }
              } else {
                net.startListeningForChanges();
              }
            })
            .start();

          //
          //RUCH KROLOWKI
          //
        } else if (
          possibleMovesQueen.filter((move) => {
            let actualMove = move.items.filter((obj) => {
              return obj.name == intersects[0].object.name;
            }).length;
            if (actualMove != 0) return move;
          }).length != 0
        ) {
          clearInterval(this.ownTime);

          possibleMovesQueen.forEach((move) => {
            move.items.forEach((item) => {
              //item.material.color.set(0xffffff);
              if (item.kolor == "bialy") {
                item.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/whiteBlock.jpg"
                  ),
                });
              } else if (item.kolor == "czarny") {
                item.material = new THREE.MeshBasicMaterial({
                  map: new THREE.TextureLoader().load(
                    "textures/blackBlock.jpg"
                  ),
                });
              }
            });
          });

          //ANIMACJA
          new TWEEN.Tween(selected.position) // co
            .to(
              {
                x: intersects[0].object.position.x,
                z: intersects[0].object.position.z,
              },
              500
            ) // do jakiej pozycji, w jakim czasie
            .repeat(0) // liczba powtórzeń
            .easing(TWEEN.Easing.Quadratic.In) // typ easingu (zmiana w czasie)
            .onUpdate(() => {})
            .onComplete(async () => {
              this.pionki[selected.x][selected.y] = 0;

              if (selected.kolor == "bialy") {
                this.pionki[intersects[0].object.x][intersects[0].object.y] = 3;
              } else if (selected.kolor == "czarny") {
                this.pionki[intersects[0].object.x][intersects[0].object.y] = 4;
              }

              //wziecie ruchu(pole + zbity pionek):
              var possibleMoveCombination = possibleMovesQueen.filter(
                (move) => {
                  let actualMove = move.items.filter((obj) => {
                    return obj.name == intersects[0].object.name;
                  }).length;
                  if (actualMove != 0) return move;
                }
              )[0];

              var zbityName = undefined;
              var zbityX = undefined;
              var zbityY = undefined;
              //USUNIECIE ZBITEGO
              if (possibleMoveCombination.zbity != undefined) {
                zbityName = possibleMoveCombination.zbity.name;
                zbityX = possibleMoveCombination.zbity.x;
                zbityY = possibleMoveCombination.zbity.y;
                this.pionki[possibleMoveCombination.zbity.x][
                  possibleMoveCombination.zbity.y
                ] = 0;
                this.scene.remove(possibleMoveCombination.zbity);
                this.piecesObjects = this.piecesObjects.filter(
                  (piece) => piece.name != zbityName
                );

                if (possibleMoveCombination.zbity.kolor == "bialy") {
                  this.blackPoints++;
                } else if (possibleMoveCombination.zbity.kolor == "czarny") {
                  this.whitePoints++;
                }
              }

              let returnedObject = await net.uploadChanges(
                intersects[0].object.x,
                selected.x,
                intersects[0].object.y,
                selected.y,
                selected.kolor,
                selected.name,
                "queen",
                zbityName,
                zbityX,
                zbityY
              );

              ui.updateCurrentArrayDisplay(
                returnedObject.currentArray,
                this.colorPionkowUsera
              );

              selected.x = intersects[0].object.x;
              selected.y = intersects[0].object.y;

              selected.setNotSelectedColor();

              //USUNIETY FRAGMENT ZWIAZANY Z WSTAWIENIEM KROLOWEJ

              selected = undefined;
              possibleMovesQueen = [];
              ui.hisTurn = false;

              if (this.whitePoints == 8) {
                if (this.colorPionkowUsera == "bialy") {
                  ui.infoAboutWinningOrLosing(
                    true,
                    "Zbiłeś wszystkie pionki przeciwnika!"
                  );
                } else if (this.colorPionkowUsera == "czarny") {
                  ui.infoAboutWinningOrLosing(
                    false,
                    "Wszystkie twoje pionki zostały zbite!"
                  );
                }
              } else if (this.blackPoints == 8) {
                if (this.colorPionkowUsera == "bialy") {
                  ui.infoAboutWinningOrLosing(
                    false,
                    "Wszystkie twoje pionki zostały zbite!"
                  );
                } else if (this.colorPionkowUsera == "czarny") {
                  ui.infoAboutWinningOrLosing(
                    true,
                    "Zbiłeś wszystkie pionki przeciwnika!"
                  );
                }
              } else {
                net.startListeningForChanges();
              }
            })
            .start();

          //
        }
      } else {
        if (selected) {
          //selected.material.color.set(0xffffff);
          if (selected.kolor == "bialy") {
            selected.material = new THREE.MeshBasicMaterial({
              map: new THREE.TextureLoader().load("textures/whitePiece.jpg"),
            });
          } else if (selected.kolor == "czarny") {
            selected.material = new THREE.MeshBasicMaterial({
              map: new THREE.TextureLoader().load("textures/blackPiece.jpg"),
            });
          }

          possibleMovesItems.forEach((obj) => {
            //obj.item.material.color.set(0xffffff);
            if (obj.item.kolor == "bialy") {
              obj.item.material = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("textures/whiteBlock.jpg"),
              });
            } else if (obj.item.kolor == "czarny") {
              obj.item.material = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("textures/blackBlock.jpg"),
              });
            }
          });
          possibleMovesQueen.forEach((move) => {
            move.items.forEach((item) => {
              item.setNotSelectedColor();
            });
          });
          possibleMovesItems = [];
          possibleMovesQueen = [];
        }
        selected = undefined;
      }
    });
  };

  updateGameBoard = (
    actualRow,
    actualColumn,
    pieceName,
    pieceType,
    currentArray,
    zbityName
  ) => {
    var selected = this.piecesObjects.filter((piece) => {
      return piece.name == pieceName;
    })[0];

    if (zbityName != undefined) {
      var zbity = this.piecesObjects.filter((piece) => {
        return piece.name == zbityName;
      })[0];
      this.piecesObjects = this.piecesObjects.filter(
        (piece) => piece.name != zbityName
      );
    }

    game.countDownOwnTime();
    ui.updateTimeLeftForUser(false, 30);

    new TWEEN.Tween(selected.position) // co
      .to(
        {
          x: 105 + actualColumn * -30,
          z: 105 + actualRow * -30,
        },
        500
      ) // do jakiej pozycji, w jakim czasie
      .repeat(0) // liczba powtórzeń
      .easing(TWEEN.Easing.Quadratic.In) // typ easingu (zmiana w czasie)
      .onUpdate(() => {})
      .onComplete(async () => {
        this.pionki[selected.x][selected.y] = 0;

        if (pieceType == "piece") {
          if (selected.kolor == "bialy") {
            this.pionki[actualRow][actualColumn] = 1;
            if (actualRow == 0) {
              this.scene.remove(selected);
            }
          } else if (selected.kolor == "czarny") {
            this.pionki[actualRow][actualColumn] = 2;
            if (actualRow == this.szachownica.length - 1) {
              this.scene.remove(selected);
            }
          }
        } else if (pieceType == "queen") {
          if (selected.kolor == "bialy") {
            this.pionki[actualRow][actualColumn] = 3;
          } else if (selected.kolor == "czarny") {
            this.pionki[actualRow][actualColumn] = 4;
          }
        }

        if (zbityName != undefined) {
          this.pionki[zbity.x][zbity.y] = 0;
          this.scene.remove(zbity);

          if (zbity.kolor == "bialy") {
            this.blackPoints++;
          } else if (zbity.kolor == "czarny") {
            this.whitePoints++;
          }
        }

        selected.x = actualRow;
        selected.y = actualColumn;

        //UTWORZENIE KROLOWEJ W MIEJSCU TAMTEGO PIONKA, KTORY DOSZEDL DO KONCA
        if (pieceType == "piece") {
          if (selected.kolor == "bialy" && selected.x == 0) {
            let queen = new Krolowa(true, this.idWhiteQueen);
            queen.position.set(selected.position.x, 20, selected.position.z);
            queen.x = selected.x;
            queen.y = selected.y;
            this.scene.add(queen);
            this.pionki[selected.x][selected.y] = 3;
            this.idWhiteQueen++;

            //czyszczenie po starym pionku
            this.piecesObjects = this.piecesObjects.filter(
              (piece) => piece.name != selected.name
            );

            this.piecesObjects.push(queen);
          } else if (
            selected.kolor == "czarny" &&
            selected.x == this.szachownica.length - 1
          ) {
            let queen = new Krolowa(false, this.idBlackQueen);
            queen.position.set(selected.position.x, 20, selected.position.z);
            queen.x = selected.x;
            queen.y = selected.y;
            this.scene.add(queen);
            this.pionki[selected.x][selected.y] = 4;
            this.idBlackQueen++;

            //czyszczenie po starym pionku
            this.piecesObjects = this.piecesObjects.filter(
              (piece) => piece.name != selected.name
            );

            this.piecesObjects.push(queen);
          }
        }

        ui.hisTurn = true;
        ui.updateCurrentArrayDisplay(currentArray, this.colorPionkowUsera);

        if (this.whitePoints == 8) {
          clearInterval(this.ownTime);
          if (this.colorPionkowUsera == "bialy") {
            ui.infoAboutWinningOrLosing(
              true,
              "Zbiłeś wszystkie pionki przeciwnika!"
            );
          } else if (this.colorPionkowUsera == "czarny") {
            ui.infoAboutWinningOrLosing(
              false,
              "Wszystkie twoje pionki zostały zbite!"
            );
          }
        } else if (this.blackPoints == 8) {
          clearInterval(this.ownTime);
          if (this.colorPionkowUsera == "bialy") {
            ui.infoAboutWinningOrLosing(
              false,
              "Wszystkie twoje pionki zostały zbite!"
            );
          } else if (this.colorPionkowUsera == "czarny") {
            ui.infoAboutWinningOrLosing(
              true,
              "Zbiłeś wszystkie pionki przeciwnika!"
            );
          }
        }
        //
      })
      .start();
  };

  countDownOwnTime = () => {
    let timeCounter = 30;
    ui.updateTimeLeftForMakeMove(true, timeCounter);
    this.ownTime = setInterval(() => {
      timeCounter--;
      ui.updateTimeLeftForMakeMove(true, timeCounter);
      if (timeCounter == 0) {
        ui.infoAboutWinningOrLosing(
          false,
          "Nie wykonałeś ruchu we wskazanym czasie"
        );
        ui.updateTimeLeftForMakeMove(false, 30);
        clearInterval(this.ownTime);
      }
    }, 1000);
  };
}

export default Game;
