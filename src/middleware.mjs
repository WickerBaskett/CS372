/**
 * Contains all custom middleware
 * @module middleware
 */
/**
 * Custom middleware to validate that user is logged in
 * @function authUser
 * @param {object} req - Request
 * @param {object} res - Response
 * @param {function} next - Next middleware
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
 * @function authContentEditor
 * @param {object} req - Request
 * @param {object} res - Response
 * @param {function} next - Next middleware
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
 * @function authMarketingManager
 * @param {object} req - Request
 * @param {object} res - Response
 * @param {function} next - Next middleware
 */
function authMarketingManager(req, res, next) {
  if (req.session.role == 2) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

export { authUser, authContentEditor, authMarketingManager };
