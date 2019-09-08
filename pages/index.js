import {Button, Icon, Tabs} from 'antd';
import getConfig from 'next/config';
import {connect} from 'react-redux';
import Router, {withRouter} from 'next/router';
import {useEffect} from 'react';
import LRU from 'lru-cache';

import Repo from '../components/Repo';
import {cacheArray} from '../lib/repoBasic-cache';

const api = require("../lib/api");
const {publicRuntimeConfig} = getConfig();
const { TabPane } = Tabs;

// Maximum age in 10min
const cache = new LRU({
  maxAge: 10 * 60 * 1000
});

let cache_userRepos, cache_userStaredRepos;
const isServer = typeof window === 'undefined';


const Index = ({userRepos, userStaredRepos, user, router}) => {
  const tabKey = router.query && router.query.key || '1';

  const handleTabChange = activeKey => {
    Router.push(`/?key=${activeKey}`);
  };

  //
  /*
  useEffect(() => {
    if(!isServer) {
      if(userRepos){
        cache.set('userRepos', userRepos);
      }
      if(userStaredRepos){
        cache.set('userStaredRepos', userStaredRepos);
      }
    }  
  }, [userRepos, userStaredRepos]);
  */
   
  //optimize
  useEffect(() => {
    if(!isServer) {
      cache_userRepos = userRepos;
      cache_userStaredRepos = userStaredRepos;

      const timeout = setTimeout(() => {
        cache_userRepos = null;
        cache_userStaredRepos = null;
       }, 1000 * 60 * 10);
    }  
  }, [userRepos, userStaredRepos]);
  
  useEffect(() => {
    if(!isServer){
      cacheArray(userRepos);
      cacheArray(userStaredRepos);
    }
  });


  if(!user || !user.id) {
    return (
      <div className="root">
        <p>Please Log in</p>
        <Button type="primary" href={publicRuntimeConfig.OAUTH_URL}>Log in</Button>
        <style jsx>{`
          .root {
            height: 400px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="root">
      <div className="user-info">
        <img src={user.avatar_url} alt="Avatar" className="avatar" />
        <span className="login">{user.login}</span>
        <span className="name">{user.name}</span>
        <span className="bio">{user.bio}</span>
        <p className="email">
          <Icon type="mail" style={{marginRight: 10}}></Icon>
          <a href={`mailto:${user.email}`}>{user.email}</a>
        </p>
      </div>
      <div className="user-repos">
      <Tabs activeKey={tabKey} onChange={handleTabChange} animated={false}>
          <TabPane tab="My Repos" key="1">
            {userRepos.map(repo => (
              <Repo key={repo.id} repo={repo} />
            ))}
          </TabPane>
          <TabPane tab="Starred Repos" key="2">
            { userStaredRepos.map(repo => (
              <Repo key={repo.id} repo={repo} />)
              )
            }
          </TabPane>
        </Tabs>
      </div>
      <style jsx>{`
        .root {
          display: flex;
          align-items: flex-start;
          padding: 20px 0;
        }

        .user-info {
          width: 200px;
          margin-right: 40px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
        }

        .login {
          font-weight: 800;
          font-size: 20px;
          margin-top: 20px;
        }

        .name {
          font-size: 16px;
          color: #777;
        }

        .bio {
          margin-top: 20px;
          color: #333;
        }

        .avatar {
          width: 100%;
          border-radius: 5px;
        }
        .user-repos {
          flex-glow: 1;
        }
      `}</style>
    </div>
  );
};


Index.getInitialProps = async ({ctx, reduxStore}) => {
  const user = reduxStore.getState().user;
  if(!user || !user.id) {
    return {
      isLogin: false,
    };
  }

  /*
  //
  if(!isServer){
    if(cache.get('userRepos') && cache.get('userStaredRepos')) {
      return {
        userRepos: cache.get('userRepos'),
        userStaredRepos: cache.get('userStaredRepos')
      }
    }
  }
  */

  if(!isServer){
    if(cache_userRepos && cache_userStaredRepos) {
      return {
        userRepos: cache_userRepos,
        userStaredRepos: cache_userStaredRepos
      }
    }
  }

  const userRepos = await api.request({
    url: '/user/repos',
  }, ctx.req, ctx.res);

  const userStaredRepos = await api.request({
    url: '/user/starred',
  }, ctx.req, ctx.res);
  

  return {
    isLogin: true,
    userRepos: userRepos.data,
    userStaredRepos: userStaredRepos.data
  }
};


const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
};


export default withRouter(connect(mapStateToProps)((Index)));
