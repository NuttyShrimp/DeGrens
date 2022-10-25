declare namespace Laptop {
  namespace Bennys {
    interface Item {
      item: string;
      label: string;
      image: string;
      price: number;
      category: string;
    }

    interface PickUp {
      coords: Vec3;
      data: {
        heading: number;
        minZ: number;
        maxZ: number;
      };
      width: number;
      length: number;
    }
  }
}
