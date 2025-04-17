// validity.mjs
// Contains logic to check username and password validity

/**
 * Checks if username meets username validity requirements
 * @param {String} username
 * @returns {Boolean}
 * */
export function checkUsername(username) {
  const email_reg = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (email_reg.test(username)) {
    console.log("Valid email address");
    return true;
  } else {
    console.log("Invalid email address");
    return false;
  }
}

/**
 * Checks if pass meets password complexity requirnments
 * @param {String} pass
 * @returns {Boolean}
 * */
export function checkPasswordFormat(pass) {
  const cap_reg = /[A-Z]/;
  const low_reg = /[a-z]/;
  const num_reg = /[0-9]/;
  const spec_reg = /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/;

  if (pass.length != 8) {
    return false;
  }

  if (!cap_reg.test(pass)) {
    return false;
  }

  if (!low_reg.test(pass)) {
    return false;
  }

  if (!num_reg.test(pass)) {
    return false;
  }

  if (!spec_reg.test(pass)) {
    return false;
  }

  return true;
}

/**
 * Checks if url is a valid url
 * @param {String} url
 * @returns {Boolean}
 * */
export function checkURL(url) {
  const url_reg =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

  if (url_reg.test(url)) {
    console.log("Valid url");
    return true;
  } else {
    console.log("Invalid url");
    return false;
  }
}

/**
 * Checks if thumbnail is a valid image link
 * @param {String} thumbnail
 * @returns {Boolean}
 * */
export function checkThumbnail(thumbnail) {
  const thumbnail_reg = /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i;

  if (thumbnail_reg.test(thumbnail)) {
    console.log("Valid thumnbail");
    return true;
  } else {
    console.log("Invalid thumbnail");
    return false;
  }
}
