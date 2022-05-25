class Item extends THREE.Mesh {
  constructor(isWhite, numberToId) {
    super(); // wywołanie konstruktora klasy z której dziedziczymy czyli z Mesha
    this.geometry = new THREE.BoxGeometry(30, 10, 30);
    this.elementType = "item";

    if (isWhite) {
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/whiteBlock.jpg"),
      });
      this.kolor = "bialy";
    } else {
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/blackBlock.jpg"),
      });
      this.kolor = "czarny";
    }
    this.name = "item_" + numberToId;
  }

  setNotSelectedColor() {
    if (this.kolor == "czarny") {
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/blackBlock.jpg"),
      });
    } else if (this.kolor == "bialy") {
      this.material = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("textures/whiteBlock.jpg"),
      });
    }
  }
}

export default Item;
