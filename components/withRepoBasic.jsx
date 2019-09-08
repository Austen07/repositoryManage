//hoc
import Repo from './Repo';
import Link from 'next/link';
import {withRouter} from 'next/router';

import {getCache, setCache} from '../lib/repoBasic-cache';
import { useEffect } from 'react';

const api = require("../lib/api");
const isServer = typeof window === 'undefined';


const makeQuery = (QueryObj) => {
  const query = Object.entries(QueryObj)
    .reduce((res, entry) => {
      res.push(entry.join("="));
      return res;
    }, []).join('&');

  return `?${query}`;
};


const withRepoBasic = (Comp, type="index") => {
  const withDetail = ({repoBasic, router, ...rest}) => {
    //console.log("detail start");
    // console.log("basic info: ", repoBasic);
    // console.log("router: ", router);

    useEffect(() => {
      if(!isServer){
        setCache(repoBasic);
      }
    });
    
    const query = makeQuery(router.query);
  
    return (
      <div className="root">
        <div className="repo-basic">
          <Repo repo={repoBasic} />
          <div className="tabs">
            {
              type === 'index' ? 
              <span className="tab">Read Me</span> :
              <Link href={`/detail${query}`}>
                <a className="tab index">Read Me</a>
              </Link>
            }

            {
              type === 'issues' ? 
              <span> Issues </span> :
              <Link href={`/detail/issues${query}`}>
                <a className="tab issues">Issues</a>
              </Link>
            }
          </div>
        </div>
        <div>
          <Comp {...rest}/>
        </div>
        <style jsx>{`
          .root {
            padding-top: 20px;
          }
  
          .repo-basic {
            padding: 20px;
            border: 1px solid #eee;
            margin-bottom: 20px;
            border-radius: 5px;
          }
  
          .tab + .tab {
            margin-left: 20px;
          }
  
        `}</style>
      </div>
    );
  };
  
  withDetail.getInitialProps = async (context) => {
    const {ctx, router} = context;
    const {owner, name } = ctx.query;
    // console.log("info ", ctx.query);

    const full_name = `${owner}/${name}`;

    let pageData = {};
    if(Comp.getInitialProps) {
      pageData = await Comp.getInitialProps(context);
    }

    if(getCache(full_name)){
      return {
        repoBasic: getCache(full_name),
        ...pageData
      }
    }

    const repoBasic = await api.request({
      url: `/repos/${owner}/${name}`
    }, ctx.req, ctx.res);

    return {
      repoBasic: repoBasic.data,
      ...pageData
    }
  };

  return withRouter(withDetail);
};

export default withRepoBasic;