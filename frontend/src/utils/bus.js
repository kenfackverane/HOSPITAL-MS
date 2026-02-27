export const emitRefresh = () => {
  window.dispatchEvent(new Event("hms:refresh"));
};

export const onRefresh = (handler) => {
  window.addEventListener("hms:refresh", handler);
  return () => window.removeEventListener("hms:refresh", handler);
};