const config = {
  database: {
    url: 'mongodb://polygons_user:polygons_password1@ds249127.mlab.com:49127/polygons',
    dbname: 'polygons',
  },
  app: {
    port: 3000,
    upload_dir: './files/{username}',
  },
  auth: {
    token: 'grG8%4@ghjjtj_654)54&??gfd4!!43VF',
    sessionTime: 3600,
    error_view: 'login',
  },
  polygons: {
    precalculate: false,
    pattern: '^\\[\\s*([-\\d]+\\.?\\d*)\\s*,\\s*([-\\d]+\\.?\\d*)\\s*\\]\\s*(.*?)$',
  }
};

module.exports = config;
