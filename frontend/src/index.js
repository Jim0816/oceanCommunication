import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

import store from './store/index.js'

// 引入antd样式
import 'antd/dist/antd.css'

// 引入路由组件
import { BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';
// 引入路由配置
import {mainRoutes} from './routes'

// 将App组件渲染到dom元素 root元素在public/index.html
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Router>
    <Switch>
      <Route path="/admin" render={routeProps => <App {...routeProps}/>}/>
      {mainRoutes.map(route => {return <Route key={route.path} {...route}></Route>})}
      <Redirect to="/admin/launch" />
    </Switch>
  </Router>
);

// 数据变化时，重新渲染
store.subscribe(() => {
  root.render(
    <Router>
      <Switch>
        <Route path="/admin" render={routeProps => <App {...routeProps}/>}/>
        {mainRoutes.map(route => {return <Route key={route.path} {...route}></Route>})}
        <Redirect to="/admin/launch" />
      </Switch>
    </Router>
  );
})
