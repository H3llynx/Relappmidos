export const createElement = (type, properties = {}) => {
  const el = document.createElement(type);
  Object.assign(el, properties);
  return el;
};

export const removeFromStorage = (...keys) => {
  keys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key)
    }
  })
};
