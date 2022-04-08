export const returnClassRefs = (classInstance: any) => {
  if (classInstance.constructor.name === 'Function') {
    return undefined;
  }
  let obj = classInstance;
  // Has all keys of the functions defined in the class
  let props = [];
  do {
    props.push(...Object.getOwnPropertyNames(obj));
  } while ((obj = Object.getPrototypeOf(obj)) && obj != Object.prototype);
  props = props.filter(prop => typeof classInstance[prop] === 'function' && prop !== 'constructor');
  const refs: Record<string, any> = {};
  props.forEach(prop => {
    refs[prop] = (...args: any[]) => {
      return classInstance[prop](...args);
    };
  });
  return refs;
};
