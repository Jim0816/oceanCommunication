import React, { Component } from 'react'
import progressBar from './index.module.css'
import Draggable from 'react-draggable'
export default class index extends Component {
  
  state = {
    startInitClientX: 0,
    endInitClientX: 0,
    unit: 0,
    startX: 0,
    endX: 0
  }

  componentDidMount() {
    var startObj = document.getElementById('start')
    var endObj = document.getElementById('end')
    let start = startObj.getBoundingClientRect().left
    let end = endObj.getBoundingClientRect().left    
    let unit = (end - start) / this.props.rangeNum
    
    this.setState({
      unit: unit,
      startInitClientX: start,
      endInitClientX: end,
      startX: start,
      endX: end
    })
    //console.log(this.state)
    //this.handleReZoom(start, end)
   }

   

  render() {
    return (
      <div className={progressBar.container}>
          <div className={progressBar.main} id=''>
            {/* <div className={progressBar.surface} style={{left: '10%', width: '40%'}}></div> */}
            {/* <Draggable axis='x' bouds='parent'>
              <div style={{width: '100%', height: '100%'}}>
                <div className={progressBar.start} style={{left: '10%'}}></div>
              </div>
              
            </Draggable>
            <Draggable axis='x' bouds='parent'>
              <div style={{width: '100%', height: '100%'}}>
                <div className={progressBar.end} style={{left: '70%'}}></div>
              </div>
            </Draggable> */}
            <Draggable axis='x' bounds='parent' 
              onStart={(e) => this.startDrag('start', e)}
              onDrag={(e) => this.handleDrag('start', e)}
              onStop={(e) => this.handleDrag('start', e)}>
              <div id='start' className={progressBar.lineBox} style={{backgroundColor: 'green', left: '0%'}}></div>
            </Draggable>

            <Draggable axis='x' bounds='parent' onDrag={(e) => this.handleDrag('end', e)}>
              <div id='end' className={progressBar.lineBox} style={{backgroundColor: 'red', left: '100%'}}></div>
            </Draggable>
            
          </div>
      </div>
    )
  }

  startDrag = (type, e) => {
    console.log('开始移动：', e)
  }

  handleDrag = (type, e) => {
    //console.log('正在移动：', e)
    if (type === 'start'){
      var startObj = document.getElementById('start')
      let startX = startObj.getBoundingClientRect().left
      this.handleReZoom(startX, this.state.endX)
    }else if (type === 'end'){
      var endObj = document.getElementById('end')
      let endX = endObj.getBoundingClientRect().left
      this.handleReZoom(this.state.startX, endX)
    }
  }

  endDrag = (type, e) => {
    console.log('停止移动：', e)
  }

  handleReZoom = (startX, endX) => {
    this.setState({
      startX: startX,
      endX: endX
    })

    let startDiff = startX - this.state.startInitClientX
    let startIndex = Math.floor(startDiff / this.state.unit)

    let endDiff = Math.floor(endX - this.state.startInitClientX)
    let endIndex = Math.floor(endDiff / this.state.unit)

    console.log('数据开始位置索引', startIndex)
    console.log('数据结束位置索引', endIndex)

    // 数据传递给父亲组件
    this.props.rezoom(startIndex, endIndex)
  }
}
