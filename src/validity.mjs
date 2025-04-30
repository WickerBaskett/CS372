/**
 * Contains logic to check username and password validity
 * @module validity
*/

/**
 * Checks if username meets username validity requirements
 * @function checkUsername
 * @param {String} username - Username to validate
 * @returns {Boolean}
 * */
function checkUsername(username) {
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
 * @function checkPasswordFormat
 * @param {String} pass - Password to validate
 * @returns {Boolean}
 * */
function checkPasswordFormat(pass) {
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
 * @function checkURL
 * @param {String} url - Url to validate
 * @returns {Boolean}
 * */
function checkURL(url) {
  const url_reg =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/;

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
 * @function checkThumbnail
 * @param {String} thumbnail - Thumbnail Url to validate
 * @returns {Boolean}
 * */
function checkThumbnail(thumbnail) {
  const thumbnail_reg =
    /^https?:\/\/(.+\/)+.+(\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif))$/i;

  if (thumbnail_reg.test(thumbnail)) {
    console.log("Valid thumnbail");
    return true;
  } else {
    console.log("Invalid thumbnail");
    return false;
  }
}

/**
 * Sanitize fields of videos based on the role of the client
 * @function sanitizeVideos
 * @param {Number} role - Role of user
 * @param {Array} videos - Unsanitized list of videos
 * @returns {Array} - Sanitized list of videos
 */
function sanitizeVideos(role, videos) {
  let result = Object.entries(videos).map((video) => {
    console.log("Video.name: ");
    console.log(video[1]);
    let sanitized = {
      name: video[1].name,
      url: video[1].url,
      thumbnail: video[1].thumbnail,
    };

    if (role == 2) {
      // Marketing Manager
      sanitized.likes = video[1].likes;
      sanitized.dislikes = video[1].dislikes;
    } else if (role == 1) {
      // Content Editor
      sanitized.comment = video[1].comment;
    }
    console.log("Sanitized: ");
    console.log(sanitized);
    return sanitized;
  });

  console.log(result);
  return result;
}

export {checkUsername, checkPasswordFormat, checkURL, checkThumbnail, sanitizeVideos}
