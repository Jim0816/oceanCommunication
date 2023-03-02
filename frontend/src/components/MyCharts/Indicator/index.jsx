import React, { Component } from 'react'
import indicator from './index.module.css'



export default class index extends Component {

  selectIndicator = (id) => {
    let {indicators, updateIndicators} = this.props
    for (let i = 0 ; i < indicators.length ; i++){
      if (indicators[i].id === id){
        indicators[i].main = true
      }else{
        indicators[i].main = false
      }
    }
    updateIndicators(indicators)
  }

  small_down = (id, e) => {
    let {labels, showWidth, showRange, indicators, updateIndicators} = this.props
    var obj = document.getElementById('indicator-' + id)
    var obig = obj.parentNode;
    var osmall = obj;
    var e = e || window.event;
    /*用于保存小的div拖拽前的坐标*/
    osmall.startX = e.clientX - osmall.offsetLeft;
    osmall.startY = e.clientY - osmall.offsetTop;

    /*鼠标的移动事件*/
    document.onmousemove = function (e) {
        var e = e || window.event;
        osmall.style.left = e.clientX - osmall.startX + "px";
        osmall.style.top = e.clientY - osmall.startY + "px";
        /*对于大的DIV四个边界的判断*/
        let x = obig.offsetWidth - osmall.offsetWidth
        let y = obig.offsetHeight - osmall.offsetHeight
        if (e.clientX - osmall.startX <= 0) {
            osmall.style.left = 0 + "px";
        }
        if (e.clientY - osmall.startY <= 0) {
            osmall.style.top = 0 + "px";
        }
        if (e.clientX - osmall.startX >= x) {
            osmall.style.left = x + "px";
        }
        if (e.clientY - osmall.startY >= y) {
            osmall.style.top = y + "px";
        }
    };
    /*鼠标的抬起事件,终止拖动*/
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
        // 拖动结束,计算当前指示器在总数据的横坐标索引
        let left = Number(osmall.style.left.substring(0, osmall.style.left.length - 2))
        let index = showRange[0] + (left / showWidth) * (showRange[1] - showRange[0])
        indicators[id].labelLocation =  index
        indicators[id].labels = labels.slice(showRange[0], showRange[1] + 1)
        updateIndicators(indicators)
    };
}


  render() {
    let {indicators} = this.props
    const elements=[];
    indicators.forEach((indicator, index)=>{
      elements.push(
        <div id={'indicator-' + indicator.id} ref='move' key={index} style={{position: 'absolute', width: '10px', height: '100%', left: indicator.left, display: 'flex', flexDirection: 'column', alignContent: 'flex-start', cursor: 'move'}} 
        onMouseDown={e => {this.small_down(indicator.id, e)}}
        onClick={e => {this.selectIndicator(indicator.id, e)}}>
          <span style={{width: '100%', height: '90%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <span id={'indicator-line-' + indicator.id} style={{width: '0px', height: '100%', border: '1px', borderStyle: indicator.main ? 'solid': 'dotted', borderColor: indicator.color}}></span>
          </span>
          <span style={{width: '100%', height: '10%', backgroundColor: indicator.color}}></span>
        </div>
      )
    })

    //console.log(elements)

    return (
      <div id="container" className={indicator.container}>
         {elements}
      </div>
    )
  }
}
