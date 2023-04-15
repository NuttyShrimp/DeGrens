export const paletoPeekCanInteractWrapper = (...ids: string[]): AllOption['canInteract'] => {
  return (_, __, option) => {
    const id: string = option.data.id;
    if (!id) return false;
    return ids.indexOf(id) !== -1;
  };
};
