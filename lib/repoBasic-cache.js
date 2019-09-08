import LRU from 'lru-cache';

//cache 1hour
const repoCache = new LRU({
  maxAge: 60 * 60 * 1000
});


export function setCache (repo) {
  const full_name = repo.full_name;
  repoCache.set(full_name, repo);
};

//fullname example: owner/name, eg. facebook/react
export function getCache (full_name) {
  return repoCache.get(full_name);
};


export function cacheArray (repos) {
  // debugger
  if(repos && Array.isArray(repos)){
    repos.forEach(repo => setCache(repo));
  }
  
};
