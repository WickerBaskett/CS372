// auth.mjs
// Contains logic to check password complexity

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

  if (cap_reg.exec(pass).length == 0) {
    return false;
  }

  if (low_reg.exec(pass).length == 0) {
    return false;
  }

  if (num_reg.exec(pass).length == 0) {
    return false;
  }

  if (spec_reg.exec(pass).length == 0) {
    return false;
  }

  return true;
}
