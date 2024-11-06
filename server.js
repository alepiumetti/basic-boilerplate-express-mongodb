/**
 * Variables
 */
const cacheTime = 43200000;
const cookieTime = 1000 * 60 * 60 * 2;

/**
 * Modules
 */
require("dotenv").config();
const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
const http = require("http");
const logger = require("morgan");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const { connectMongo } = require("./config/mongo/config");
const APP = require("./config/app/main"); // App configuration

/**
 * Creates folder log
 */
if (!fs.existsSync("./logs")) {
  console.log("[+] logs folder created");
  fs.mkdirSync("./logs");
}

function initserver() {
  /**
   * Express configuration
   */
  const app = express();

  app.set("json spaces", 2);
  app.use(logger("dev"));

  app.use(
    express.static(path.join(__dirname, "public"), {
      maxAge: cacheTime,
    })
  );

  /**
   * Error log management
   */
  let errorLogStream = fs.createWriteStream(__dirname + "/logs/error.log", {
    flags: "a",
  });

  /**
   * Error handling, avoiding crash
   */
  process.on("uncaughtException", (err, req, res, next) => {
    let date = new Date();
    console.error(`+++++++ ${date} error found, logging event +++++++ `);
    console.error(err.stack);
    errorLogStream.write(`${date} \n ${err.stack} \n\n`);
    return;
  });

  /**
   * Helment security lib
   */
  app.use(helmet());

  /**
   * Response definition
   */
  app.use((req, res, next) => {
    res.success = (data, status) => {
      return res.status(status ? status : 200).send({
        success: true,
        data: data ? data : "",
        error: null,
      });
    };

    res.failure = (errorCode, errorMsg, status) => {
      return res.status(status ? status : 200).send({
        success: false,
        data: null,
        error: {
          code: errorCode ? errorCode : -1,
          message: errorMsg ? errorMsg : "Unknown Error",
        },
      });
    };

    next();
  });

  /**
   * Compress middleware to gzip content
   */
  app.use(compression());
  // app.use(favicon(__dirname + '/public/img/favicon.png'))

  /**
   * Require Mongo configuration
   */
  require("./config/mongo/config");

  /**
   * Require local and social network passport
   */
  require("./config/passport/local");

  /**
   * View engine setup
   */

  app.use(bodyParser.json({ limit: "50mb" }));
  // app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: false,
    })
  );
  app.use(cookieParser(APP.dbname));

  app.use(
    session({
      name: APP.dbname,
      secret: process.env.SECRET, //! revisar
      saveUninitialized: true,
      resave: true,
      cookie: {
        maxAge: cookieTime,
        proxy: true,
        sameSite: "None",
        secure: true,
      },
      store: new MongoStore({
        url: `mongodb://localhost/${APP.dbname}`,
        host: "localhost",
        collection: "sessions",
        autoReconnect: true,
        clear_interval: 3600,
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    cors({
      credentials: true,

      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );

  //app.use(cors());

  /**
   * Routes
   */
  require("./routes/index")(app);

  /**
   * Disable server banner header
   */
  app.disable("x-powered-by");

  /**
   * Catch 404 and forward to error handler
   */
  app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  /**
   * Error Handlers
   *
   * Development error handler
   * Will print stacktrace
   */
  if (process.env.NODE_ENV === "development") {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        error: err,
      });
    });
  }

  /**
   * Production error handler
   * No stacktraces leaked to user
   */
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: {},
    });
  });

  /**
   * Firing Up express
   */
  app.set("port", process.env.PORT || APP.port);

  http.createServer(app).listen(app.get("port"), () => {
    console.log(`${APP.name} server listening on port ${app.get("port")}`);
  });
} // initserver()

/**
 * Inicializo MongoDB,
 * luego inicializo el servidor
 */
connectMongo().then(initserver);
