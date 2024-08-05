/* eslint-disable */

export const hideAlert = () => {
    const el = document.querySelector('.alert')
    if(el)el.parentElement.removeChild(el)

}
export const showAlert = (type, msg) => {
    hideAlert()
  const markup = `<div class ="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup)
  window.setTimeout(hideAlert, 5000)
};
