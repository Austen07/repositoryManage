import {memo, isValidElement, useEffect} from 'react';
import Router, { withRouter } from 'next/router';
import {Row, Col, List, Pagination} from 'antd';
import Item from 'antd/lib/list/Item';
import Link from 'next/link';

import Repo from '../components/Repo';
import {cacheArray} from '../lib/repoBasic-cache';



const api = require("../lib/api");

const LANGUAGES = ['JavaScript', 'Java', 'HTML', 'CSS', 'Python'];
const SORT_TYPES = [
  {
    name: 'Best Match'
  },
  {
    name: 'Most Stars',
    value: "stars",
    order: "desc"
  },
  {
    name: 'Fewest Stars',
    value: "stars",
    order: "asc"
  },
  {
    name: 'Most Forks',
    value: "forks",
    order: "desc"
  },
  {
    name: 'Fewest Forks',
    value: "forks",
    order: "asc"
  },
];

//selected style
const selectedItemStyle = {
  borderLeft: '2px solid #e36e09',
  fontWeight: 100
};


const nope = () => {};
const per_page = 20;
const isServer = typeof window === 'undefined';


//small component
const Filter = memo(({name, query, lang, sort, order, page}) => {
  let queryString = `?query=${query}`;
  if(lang) queryString += `&lang=${lang}`;
  if(sort) queryString += `&sort=${sort}&order=${order || 'desc'}`;
  if(page) queryString += `&page=${page}`;
  
  queryString += `&per_page=${per_page}`

  return (
    <Link href={`/search${queryString}`}>
      {isValidElement(name) ? name : <a>{name}</a>}
    </Link>
  );
});



const Search = ({router, repos}) => {
  // console.log("get search res:", repos);

  const {...querys} = router.query;
  const {lang, sort, order, page} = router.query;

  useEffect(() => {
    if(!isServer){
      cacheArray(repos.items);
    }
  });

  return (
    <div className="root">
      <Row gutter={20}>
        <Col span={6}>
          <List 
            bordered
            header={<span className="list-header">Language</span>}
            style={{marginBottom: 15}}
            dataSource={LANGUAGES}
            renderItem={item => {
              const selected = lang === item;
              return (
                <Item style={selected ? selectedItemStyle : null}>
                  {selected ? <span>{item}</span> : <Filter {...querys} lang={item} name={item} />  }
                </Item>
              )
            }}
          />
          <List 
            bordered
            header={<span className="list-header">SORT BY</span>}
            dataSource={SORT_TYPES}
            renderItem={item => {
              let selected = false;
              if(item.name === 'Best Match' && !sort){
                selected = true;
              }else if(item.value === sort && item.order === order){
                  selected = true;
              }

              return (
                <Item style={selected ? selectedItemStyle : null}>
                  {selected ? <span>{item.name}</span> : <Filter {...querys} order={item.order} name={item.name} sort={item.value}/>}
                </Item>
              )
            }}
          />
        </Col>
        <Col span={18}>
            <h3 className="repos-title">{repos.total_count} Repositories</h3>
            {
              repos.items.map(repo => <Repo repo={repo} key={repo.id} />)
            }
            <div className="pagination">
              <Pagination 
                pageSize={per_page}
                current={Number(page) || 1}
                total={repos.total_count < 100 ? repos.total_count : 100}
                onChange={nope}
                itemRender={(page, type, ol) => {
                  const p = type === 'page' ? page : (type === 'prev' ? page - 1 : page + 1);
                  const name = type === 'page' ? page : ol;
                  return <Filter {...querys} page={p} name={name} />
                }}
              />
            </div>
        </Col>
      </Row>
      <style jsx>{`
        .root {
          padding: 20px 0;
        }
        .list-header {
          font-weight: 800;
          font-size: 16px;
        }
        .repos-title {
          border-bottom: 1px solid #eee;
          font-size: 24px;
          line-height: 50px;
        }
        .pagination {
          padding: 20px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

Search.getInitialProps = async ({ctx}) => {
  const {query, sort, order, lang, page} = ctx.query;
  
  if(!query) {
    return {
      repos: {
        total_count: 0
      }
    }
  }

  
  let queryString = `?q=${query}`;
  if(lang) queryString += `+language:${lang}`;
  if(sort) queryString += `&sort=${sort}&order=${order || 'desc'}`;
  if(page) queryString += `&page=${page}`;
  queryString += `&per_page=${per_page}`;

  const result = await api.request({
    url: `/search/repositories${queryString}`,
  }, ctx.req, ctx.res);

  return {
    repos: result.data,
  }
};


export default withRouter(Search);