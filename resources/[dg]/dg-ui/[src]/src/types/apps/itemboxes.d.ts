declare namespace Itemboxes {
  interface State {
    itemboxes: Itembox[];
  }

  interface Itembox {
    image: string;
    action: string;
    isLink?: boolean;
  }
}
