//fetch data, run on both server and client
const axios = require('axios');

const GITHUB_BASE_URL = "https://api.github.com";

async function requestGithub(method, url, data, headers) {
  return await axios({
    method,
    url: `${GITHUB_BASE_URL}${url}`,
    data,
    headers
  });
};


const isServer = typeof window === 'undefined';

//two cases
async function request({ method = 'GET', url, data = {} }, req, res) {
  if(!url) {
    throw Error('url does not exist');
  }

  if(isServer) {
    const session = req.session;
    const githubAuth = session.githubAuth || {};
    let headers = {};
    if(githubAuth && githubAuth.access_token){
      headers['Authorization'] = `${githubAuth.token_type} ${githubAuth.access_token}`;
    }

    return await requestGithub(method, url, data, headers);
  }else{
    return await axios({
      method,
      url: `/github${url}`,
      data
    })
  }
};

module.exports = {
  request, 
  requestGithub
};