const jwt = require('jsonwebtoken');

const auth = (Server) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] :
        req.cookies.authorization ? req.cookies.authorization.split(" ")[1] : null;
      if (token) {
        jwt.verify(token, Server.config.auth.token, async (err, payload) => {
          if (payload) {
            const user = await Server.user.getByUsername(payload.username);
            if (user) {
              req.user = user;
              next();
            }
          } else {
            res.status('403').render(Server.config.auth.error_view);
          }
        })
      } else {
        res.status('403').render(Server.config.auth.error_view);
      }
    } catch (e) {
      res.status('403').render(Server.config.auth.error_view);
    }
  };
};

module.exports = auth;

module.exports.router = (router, Server) => {
  router.use(auth(Server));
  return router;
};
