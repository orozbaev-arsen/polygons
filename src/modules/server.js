// system libraries
const http = require('http');
const path = require('path');
const fs = require('fs');

// packages
const express = require('express');
const mongodb = require('mongodb');
const moment = require('moment');

// modules for packages
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');

// project modules
const User = require('./user');
const Files = require('./files');
const Polygons = require('./polygons');

class Server {
  constructor(config = {}) {
    this.config = config;
    this.mode = process.env.NODE_ENV || 'development';
    this.middlewares = require('../middlewares');
    this.routers = require('../api');
  }

  get FILES() {
    return this.collection('files');
  }

  async initialize() {
    await this.express();
    await this.database();
    await this.router();

    this.user = new User(this);
    this.files = new Files(this);
    this.polygons = new Polygons(this);

    await this.polygons.initialize();
  }

  log(...args) {
    if (this.mode !== 'production') {
      console.log.apply(null, args);
    }
  }

  express() {
    const app = express();
    const server = http.Server(app);

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const username = req.user ? req.user.username : 'unknown';
        const dir = this.config.app.upload_dir.replace('{username}', username);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        const filename = moment().format('YYYYMMDD-HHmmss');
        cb(null, filename + ext);
      }
    });
    this.upload = multer({ storage });

    app.set('views', './src/views/');
    app.set('view engine', 'pug');
    app.use('/scripts', express.static(path.join('.', 'public', 'scripts')));
    app.use('/styles', express.static(path.join('.', 'public', 'styles')));
    app.use('/images', express.static(path.join('.', 'public', 'images')));

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(cookieParser());

    if (this.mode !== 'production') {
      app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Methods", "DELETE, PUT, POST, GET, OPTIONS");
        next();
      });
    }

    this.app = app;

    server.listen(this.config.app.port || 8080, () => {
      console.log('Server starts...');
    });
  }

  database() {
    const MongoClient = mongodb.MongoClient(this.config.database.url, {useNewUrlParser: true});
    return MongoClient.connect()
      .then((client) => {
        this.log('[mongodb] connected');
        this.client = client;
        this.db = client.db(this.config.database.dbname);
        return client;
      });
  }

  router() {
    this.app.get('/', (req, res) => {
      res.redirect('admin');
    });
    this.app.get('/admin', [this.middleware('auth')], (req, res) => {
      res.render('main');
    });
    this.app.get('/error', (req, res) => {
      res.render('error');
    });
    this.app.get('/login', (req, res) => {
      res.render('login');
    });

    Object.keys(this.routers).forEach((name) => {
      if (typeof this.routers[name] === 'function') {
        const router = this.routers[name](this);
        if (router) {
          this.log(`[router] /api/${name}/`);
          this.app.use(`/api/${name}/`, router);
        }
      }
    });
  }

  /**
   * add middleware to router
   * @param name
   * @param router
   * @returns {*}
   */
  middleware(name, router = false) {
    if (this.middlewares[name]) {
      if (router) {
        this.middlewares[name].router(router, this);
      } else {
        return this.middlewares[name](this);
      }
    }
    return false;
  }

  /**
   * get database collection
   * @param name
   * @returns {Collection}
   */
  collection(name) {
    if (!this.db) {
      new Error('no database connection');
    }
    return this.db.collection(name);
  }


}

module.exports = Server;
