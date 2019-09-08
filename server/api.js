/*
process requests from browser, take access_token from session
and add it into header, then send request to fetch data
*/


const axios = require("axios");

const {requestGithub} = require("../lib/api");


module.exports = (server) => {
  server.use(async (ctx, next) => {
    const path = ctx.path;

    if(path.startsWith('/github/')){
      const method = ctx.method;
      const url = ctx.url.replace("/github/", "/");

      const session = ctx.session;
      const githubAuth = session && session.githubAuth || {};
      let headers = {};

      if(githubAuth && githubAuth.access_token){
        headers['Authorization'] = `${githubAuth.token_type} ${githubAuth.access_token}`;
      }

      const result = await requestGithub(method, url, ctx.request.body || {}, headers);

      ctx.status = result.status;
      ctx.body = result.body;

    }else{
      await next();
    }
  });
};
