class Krolowa extends THREE.Mesh {
  constructor(isWhite, id) {
    super(); // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha
    this.geometry = new THREE.CylinderGeometry(0, 15, 30, 25);
    this.elementType = "queen";

    if (isWhite) {
      this.kolor = "bialy";
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/whitePiece.jpg"),
      });
      this.name = "k_b" + id;
    } else if (isWhite == false) {
      this.kolor = "czarny";
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/blackPiece.jpg"),
      });
      this.name = "k_c" + id;
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

export default Krolowa;
