// 根组件
import React from "react";
import './App.css';

// 引入路由组件
import { Switch, Route, Redirect} from 'react-router-dom';

// 引入路由配置
import {adminRoutes} from './routes'

import Frame from './components/Frame'


function App() {
  return (
    <Frame>
      <Switch>
        {adminRoutes.map(route => {
          return(
            <Route 
              key={route.path} 
              path={route.path} 
              exact={route.exact} 
              render={routeProps => {return <route.component {...routeProps}></route.component>}}>
            </Route>
          );
        })}
        <Redirect to="/404" />
      </Switch>
    </Frame>
  )
}

export default App;