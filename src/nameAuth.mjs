// auth.mjs
// Contains logic to check username validity

/**
 * Checks if username meets username validity requirements
 * @param {String} username
 * @returns {Boolean}
 * */
export function checkUsername(username) {
  const email_reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (email_reg.test(username)) {
    console.log("Valid email address");
    return true;
  } else
    console.log("Invalid email address");
    return false;
}
