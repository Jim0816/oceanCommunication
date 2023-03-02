import React, { Component } from 'react'
import line from './index.module.css'
export default class index extends Component {
  render() {
    let borderStyle = this.props.main ? 'solid' : 'dotted'
    return (
      <div className={line.container}>
          <div className={line.top} style={{borderColor: this.props.lineColor, borderStyle: borderStyle}}></div>
          <div className={line.bottom} style={{backgroundColor: this.props.lineColor, borderStyle: borderStyle}}></div>
      </div>
    )
  }
}
