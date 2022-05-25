class Pionek extends THREE.Mesh {
  constructor(isWhite, numberToId) {
    super(); // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha
    this.geometry = new THREE.CylinderGeometry(15, 15, 10, 25);
    this.elementType = "piece";

    if (isWhite) {
      this.kolor = "bialy";
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/whitePiece.jpg"),
      });
      this.name = "b" + numberToId;
    } else if (isWhite == false) {
      this.kolor = "czarny";
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/blackPiece.jpg"),
      });
      this.name = "c" + numberToId;
    }
  }

  setNotSelectedColor() {
    if (this.kolor == "czarny") {
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/blackPiece.jpg"),
      });
    } else if (this.kolor == "bialy") {
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/whitePiece.jpg"),
      });
    }
  }
}

export default Pionek;
