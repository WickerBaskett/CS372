////////////////////////////////////
//     Custom Auth Middleware     //
////////////////////////////////////

/**
 * Custom middleware to validate that user is logged in
 * @param {JSON} req 
 * @param {JSON} res 
 * @param {function} next 
 */
export function authUser(req, res, next) {
  if (req.session.isLoggedIn == true) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

/**
 * Custom middleware to validate that user is a Content Editor
 * @param {JSON} req 
 * @param {JSON} res 
 * @param {function} next 
 */
export function authContentEditor(req, res, next) {
  if (req.session.role == 1) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}

/**
 * Custom middleware to validate that user is a Content Editor
 * @param {JSON} req 
 * @param {JSON} res 
 * @param {function} next 
 */
export function authMarketingManager(req, res, next) {
  if (req.session.role == 2) {
    next();
  } else {
    res.redirect("/login.html?alert=2");
  }
}
