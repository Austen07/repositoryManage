const Koa = require('koa');
const next = require('next');
const Router = require('koa-router');

const koaBody = require("koa-body");

const session = require('koa-session');
const Redis = require('ioredis');
const RedisSessionStore = require('./server/session-store');

const atob = require("atob");
//may have error on windows, just refresh the webpage again


//from server folder
const auth = require('./server/auth');
const api = require('./server/api');


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

//创建redis client，以用来传入redis session store
const redis = new Redis();

global.atob = atob;

app.prepare().then(() => {
  const server = new Koa(); 
  const router = new Router();

  //https://github.com/koajs/session
  server.keys = ['gitMark APP SAY Hello']; 
  server.use(koaBody());

  const SESSION_CONFIG = {
    key: 'hahaha',
    store: new RedisSessionStore(redis),
    //store the session content in external store Redis
  };

  server.use(session(SESSION_CONFIG, server));

  
  auth(server);//github OAuth
  api(server);//github api

  //just for test
  // router.get('/api/user/info', async ctx => {
  //   const user = ctx.session.userInfo;
  //   if (!user) {
  //     ctx.status = 401;
  //     ctx.body = 'You need to log in';
  //   } else {
  //     ctx.body = user;
     
  //     ctx.set('Content-Type', 'application/json');
  //   }
  // });

  server.use(router.routes());

  server.use(async (ctx, next) => {
    ctx.req.session = ctx.session;
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    //bypass Koa's built-in response handling，
    //use next to do fetching data
  });

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });

  server.listen(3000, () => {
    console.log('koa server listening on 3000');
  });

});
