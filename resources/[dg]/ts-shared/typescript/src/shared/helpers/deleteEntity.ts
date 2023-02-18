const cfxDeleteEntity = DeleteEntity;

global.DeleteEntity = entity => {
  const err = new Error();
  console.log(
    `Deleting entity with handle: ${entity}, origin from: ${GetInvokingResource() ?? GetCurrentResourceName()}`
  );
  console.log(err.stack);
  cfxDeleteEntity(entity);
};
