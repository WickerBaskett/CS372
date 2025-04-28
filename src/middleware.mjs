// middleware.mjs
// Contains all custom middleware

/**
 * Custom middleware to validate that user is logged in
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
function authUser(req, res, next) {
  if (req.session.isLoggedIn == true) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

/**
 * Custom middleware to validate that user is a Content Editor
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
function authContentEditor(req, res, next) {
  if (req.session.role == 1) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

/**
 * Custom middleware to validate that user is a Content Editor
 * @param {object} req
 * @param {object} res
 * @param {function} next
 */
function authMarketingManager(req, res, next) {
  if (req.session.role == 2) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

export {authUser, authContentEditor, authMarketingManager};
