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
