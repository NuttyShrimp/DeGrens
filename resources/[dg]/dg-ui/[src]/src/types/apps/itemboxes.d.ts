declare namespace Itemboxes {
  interface State extends Base.State {
    itemboxes: Itembox[];
  }

  interface Itembox {
    image: string;
    action: string;
  }
}
