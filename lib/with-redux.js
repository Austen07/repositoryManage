import React from 'react';
import createSore from '../store/store';


const isServer = typeof window === 'undefined';
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';//自定义的变量

//helper function
const getOrCreateStore = (initialState) => {
  if (isServer) {
    return createSore(initialState);
  }

  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = createSore(initialState);
  }
  return window[__NEXT_REDUX_STORE__]
}



export default (Comp) => {
  class WithReduxApp extends React.Component {
    constructor(props) {
      super(props);
      this.reduxStore = getOrCreateStore(props.initialReduxState);
    }

    render() {
      const {  Component, pageProps, ...rest } = this.props;
      return (
        <Comp Component={Component}  
              pageProps={pageProps}
              {...rest}   
              reduxStore={this.reduxStore}
        />
      );
    }
  };

  
  WithReduxApp.getInitialProps = async (ctx) => {
    let reduxStore;

    if(isServer){
      const {req} = ctx.ctx;
  
      const session = req.session;

      if(session && session.userInfo){
        reduxStore = getOrCreateStore({
          user: session.userInfo
        });
      }else{
        reduxStore = getOrCreateStore();
      }
    }else{
      reduxStore = getOrCreateStore();
    }
    
    ctx.reduxStore = reduxStore;

    let appProps = {};
    if (typeof Comp.getInitialProps === 'function') {
      appProps = await Comp.getInitialProps(ctx);
    }

    return {
      ...appProps,
      initialReduxState: reduxStore.getState()
    }
  }

  return WithReduxApp;
}