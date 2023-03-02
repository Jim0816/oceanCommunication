import React, { Component } from 'react'
import './index.css'
import triangle from '../../../asserts/photo/triangle.png'
import arrow from '../../../asserts/photo/arrow.png'
export default class index extends Component {
  render() {
    return (
      <div className='container'>
          <div className='triangle'>
          <img src={triangle} style={{height: "100%", width: "100%"}}></img>
          </div>

          <div className='arrow'>
          <img src={arrow} style={{height: "100%", width: "100%"}}></img>
          </div>
      </div>
    )
  }
}
