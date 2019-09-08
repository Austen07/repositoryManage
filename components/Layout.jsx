import { Layout, Icon, Input, Avatar, Tooltip, Dropdown, Menu } from 'antd';
import {useState, useCallback} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'next/router';
import Link from 'next/link';

import Container from './Container';
import {Logout} from '../store/actions/actions';


const {Header, Content, Footer} = Layout;

const iconStyle = {
  color: 'white',
  fontSize: 40,
  display: 'block',
  paddingTop: 10,
  marginRight: 20
};

const footerSyle = {
  textAlign: 'center'
};


//chilren就是接收过来的<Component {...pageProps} />，原封不动的显示
const myLayout = ({ children, user, logout, router }) => {
  const urlQuery = router.query && router.query.query;

  const [search, setSearch] = useState(urlQuery || '');

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value)
  }, [setSearch]);

  const handleOnSearch = useCallback(() => {
    router.push(`/search?query=${search}`);
  }, [search]);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const userDropDown = (
    <Menu>
      <Menu.Item>
        <a href="javascript:void(0)">Log out</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Header>
        <Container renderer={<div className="header-inner" />}>
            <div className="header-left">
              <div className="logo">
                <Link href="/">
                  <Icon type="github" style={iconStyle}/>
                </Link>
              </div>
              <div>
                <Input.Search placeholder="search repositary" 
                              value={search}
                              onChange={handleSearchChange}
                              onSearch={handleOnSearch}
                              />
              </div>
            </div>
            <div className="header-right">
              <div className="user">
                {
                  user && user.id ? (
                    <Dropdown overlay={userDropDown}>
                      <a href="/" onClick={handleLogout}>
                        <Avatar size={40} src={user.avatar_url} />
                      </a>
                    </Dropdown>
                  ) : (
                    <Tooltip title="Log in">
                      <a href={`/prepare-auth?url=${router.asPath}`} >
                        <Avatar size={40} icon="user"/>
                      </a>
                    </Tooltip>
                  )
                }
              </div>
            </div>
        </Container>
      </Header>
      <Content>
        <Container>
          {children}
        </Container>
      </Content>
      <Footer style={footerSyle}>
        @expecto patronum
      </Footer>
      <style jsx>{`
        .header-inner {
          display: flex;
          justify-content: space-between;
        }
        .header-left {
          display: flex;
          justify-content: flex-start;
        }
      `}</style>
      <style jsx global>{`
        #__next {
          height: 100%;
        }  
        .ant-layout {
          min-height: 100%;
        }
        .ant-layout-header {
          padding-left: 0;
          padding-right: 0;
        }
        .ant-layout-content {
          background: #fff;
        }
      `}</style>
    </Layout>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(Logout())
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(myLayout));