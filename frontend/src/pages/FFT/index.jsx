import React, { Component } from 'react'
import { message } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import receipt from './index.module.css'
import LineChart from '../../components/Echarts/lineChart'
import OverviewBar from '../../components/MyCharts/OverviewBar'
import Indicator from '../../components/MyCharts/Indicator'
import Draggable from 'react-draggable'
import {getData} from '../../utils/test'


const showWidth = 1000 // 坐标轴实际宽度
const chartHeight = 130
const colors = ['red', 'black', 'green', 'orange', 'pink', 'yellow', 'blue']

const rdom = require('react-dom');

export default class index extends Component {

  state = {
    websocket: null,
    //heart_count: 0, // 数据刷新心跳
    //re_conn_count: 0, // 重复连接次数
    labels: [], // 最初的横坐标集合（一级）
    sub_labels: [], //最初的横坐标集合（二级）
    charts: [], // 记录最初上方所有折线图数据,
    cur_labels: [], // 滑动时的暂时横坐标 
    cur_sub_labels: [], // 滑动时的暂时横坐标 
    cur_charts: [], // 滑动时暂时的数据
    indicators: [],
    showRange: [], // 当前展示区间索引
    dataNum: 1024, // 单位时间产生的数据量
    lineChartWidth: 0, // 折线图坐标区域宽度
    LineChartLeftBorder: 0, // 折线图坐标区域左边界位置
    indicatorXBeforeMove: '0px', // 指示器移动前位置
    indicatorLabelBeforeMove: 0, // 指示器移动前对应横坐标比例 如 1.2 【1，2，3，4】表示在2，3之间的20%
  };


  constructor(props) {
    super(props)
   }

   componentDidMount() {
    //let {heart_count, re_conn_count} = this.state
    // websocket连接
    this.websocket_conn()

    // 定时判断websocket数据是否异常
    //this.interval = setInterval(() => {this.watch_connection()},5000);

   }

  //  watch_connection = () => {
  //   let {heart_count, re_conn_count} = this.state
  //   console.log('数据更新心跳: ', heart_count)
  //     if (heart_count > 0) {
  //       // 数据接收正常,重新记录
  //       this.state.heart_count = 0
  //       this.state.re_conn_count = 0
  //     }else{
  //       // 数据接收异常, 重新连接
  //       if (re_conn_count < 3){
  //         console.log('正在重新连接.....,已经连接次数: ', re_conn_count + 1)
  //         this.websocket_conn()
  //         this.state.re_conn_count = re_conn_count + 1
  //       }
  //     }
  //  }

  render() {
    // 获取状态数据
    let {indicators, showRange,labels, sub_labels, charts, cur_charts, cur_labels, cur_sub_labels} = this.state
    
    return (
      <div className={receipt.container}>
          <div className={receipt.center} onWheel={(e) => this.handleScroll(e)} >
            {/* 折线图 */}
            <div className={receipt.chartContainer}>
              <div style={{position: 'relative', width: '100%', height: '100%'}}>
                {cur_charts.map(
                    (chart, index) => {
                        return (
                          <div key={index} id='chartCard' className={receipt.chartCard} style={{height: chartHeight + 'px'}}>
                            <div onMouseDown={e => {this.moveChart(e)}} id='line-border-box' style={{position: 'relative', width: (showWidth + 30 * 2) + 'px', height: '100%', overflow: 'hidden'}}>
                              <LineChart title={chart.title} labels={cur_labels} sub_labels={cur_sub_labels} values={chart.values} height={chartHeight}/>
                            </div>
                          </div>
                        )
                    }
                )}
              </div>
            </div>
            
            
            {/* 时间指示器 竖线 */}
            <div className={receipt.indicatorContainer}>
              {/*  注意: 10代表指示器宽度 */}
              <div style={{position: 'relative', top: '45px', width: showWidth + 10 + 'px', height: (chartHeight + 30) * 3 - 40 + 'px'}}>
              <Indicator
                  labels={labels}
                  showWidth={showWidth}
                  showRange={showRange}
                  indicators={indicators} 
                  updateIndicators={this.updateIndicators}/>
              </div>
            </div>
            {/* <div id='lineContentBox-parent'className={receipt.lineContent} style={{height: (chartHeight - 28) * charts.length + 'px'}}>
              <div id='lineContentBox' className={receipt.lineContentBox} style={{width: showWidth + 10 + 'px'}}>
                <Indicator 
                  labels={this.state.labels}
                  showWidth={showWidth}
                  showRange={this.state.showRange}
                  indicators={this.state.indicators} 
                  updateIndicators={this.updateIndicators}/>
              </div>
            </div> */}

          </div>
          <div className={receipt.bottom} style={{display: labels.length == 0 ? 'none' : 'flex'}}>
            {/* 2表示边界宽度 1*2 */}
            <div style={{float: 'left', marginLeft: '1%', marginTop: '10px', width: showWidth + 'px', height: '70px', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              <OverviewBar 
              width={showWidth}
              height={70}
              showRange={showRange}
              indicators={indicators} 
              labels={labels} sub_labels={sub_labels} charts={charts} />
            </div>
            <div style={{float: 'left', marginLeft: '0.4%', marginTop: '10px', width: '2%', height: '70px', fontSize: '20px', lineHeight: '20px', fontWeight: 'bolder'}}>
              <span onClick={this.addIndicator} style={{float: 'left', marginLeft: '0%', marginTop: '7px', width: '100%', height: '23px', textAlign: 'center', background: 'gray', cursor: 'pointer'}}>+</span>
              <span onClick={this.removeIndicator} style={{float: 'left', marginLeft: '0%', marginTop: '10px', width: '100%', height: '23px', textAlign: 'center', background: 'gray', cursor: 'pointer'}}>-</span>
            </div>
            {/* <ProgressBar style={{float: 'left', width: '100%', height: '100%'}} rangeNum={10} rezoom={this.rezoom}/> */}
          </div>
      </div>
    )
  }

  

  /******
   ************   自定义方法  **************
   * *****/ 
  // TODO 暂时不同 鼠标拖拽 index表示数组索引 type表示事件类型 1:左键按下 2:正在拖拽 3:松开左键
  dragIndicatior = (index, type) => {
    const list = this.state.lines
    if (type === 1){
      // 开启拖拽
      //console.log('拖拽开始...')
      this.setState({
        lines: list.map((item, idx) => idx === index ? {...item, isDrag: true} : item)
      })
    }else if(type === 2){
      let line = list[index]
      if(line.isDrag){
        // 拖拽已经开启
        //console.log('==========正在拖拽=========')
      }
    }else if(type === 3){
      // 关闭拖拽
      //console.log('拖拽结束...')
      this.setState({
        lines: list.map((item, idx) => idx === index ? {...item, isDrag: false} : item)
      })
    }
    
    
  }

  websocket_conn = () => {
    if(typeof(WebSocket) == "undefined") {
      console.log("您的浏览器不支持WebSocket");
    }else{
      console.log("您的浏览器支持WebSocket");
    }

    let websocket  = new WebSocket("ws://localhost:8000/raw");

    //打开事件
    websocket.onopen = this.open

    //发现消息进入ß
    websocket.onmessage = this.message
    //关闭事件
    websocket.onclose = this.close
    //发生了错误事件
    websocket.onerror = function() {
      console.log("websocket发生了错误");
      message.error('websocket连接失败，请重试!')
    }
  }

  open = (e) => {
    console.log("websocket连接成功");
    let websocket = e.currentTarget
    this.state.websocket = websocket
    websocket.send("200")
  }

  close = (e) => {
    console.log("websocket已关闭", e.code, e.reason);
    message.error('websocket连接已关闭!')
    //this.websocket_conn()
  }

  message = (msg) => {
    let {showRange, dataNum, websocket} = this.state
    //console.log("websocket有数据",websocket);
    // 回复收到
    websocket.send("201")
    //this.state.heart_count = heart_count + 1// 数据接收心跳
    // 逻辑处理，这里this可以正常获取了
    // 初始化折线图数据
    const data = JSON.parse(msg.data)
    let labels = data.labels
    let sub_labels = data.sub_labels
    let charts = data.charts

    let cur_labels = []
    let cur_sub_labels = []
    let cur_charts = []
    let cur_range = []
    let cur_indicators = []

    if (showRange.length == 0){
      // 第一次接收数据
      cur_labels = labels
      cur_sub_labels = sub_labels
      cur_charts = charts
      cur_range = [0, labels.length - 1]
    }else {
      // 之前已经接收过数据, 区间已经设置好了
      let start_offset = showRange[0] - (this.state.labels.length / dataNum - 1) * dataNum // 计算上一次的起点偏移
      let start = Math.floor((labels.length / dataNum - 1) * dataNum + start_offset) // 向上取整
      let end = start + (showRange[1] - showRange[0]) // [start, end]
      cur_labels = labels.slice(start, end + 1)
      cur_sub_labels = sub_labels.slice(start, end + 1)

      // 更新折线图
      let new_charts = []
      for (let i = 0 ; i < charts.length ; i++){
        let chart = JSON.parse(JSON.stringify(charts[i]))
        // 从全局数据中截取
        let values_in_new_chart = []
        for (let j = 0 ; j < chart.values.length ; j++) {
          values_in_new_chart.push({"name": chart.values[j].name, "value": chart.values[j].value.slice(start, end + 1)})
        }
        let new_chart = {
          "title": chart.title,
          values: values_in_new_chart
        }
        new_charts.push(new_chart)
      }
      cur_charts = new_charts
      cur_range = [start, end]

      // 更新指示器位置
      let old_indicators = this.state.indicators
      for (let i = 0 ; i < old_indicators.length ; i++){
        let indicator = JSON.parse(JSON.stringify(old_indicators[i]))
        let left = '0px'
        //console.log(start, end, labelLocation)
        let labelLocation = (labels.length / dataNum - 1) * dataNum + indicator.labelLocation
        if (labelLocation >=  start && labelLocation <= end){
          // 在展示范围内
          let itemWidth = showWidth / (end - start)
          left = (labelLocation - start) * itemWidth + 'px'
        }else{
          // 超出展示范围
          if (labelLocation > end){
            // 靠右边
            left =  showWidth + 'px'
          }else if (labelLocation < start){
            // 靠左边
            left = '0px'
          }
        }
      
        cur_indicators.push({
          "id": indicator.id,
          "color": indicator.color,
          "labelLocation": labelLocation,
          "labels": labels.slice(start, end + 1),
          "left": left,
          "main": indicator.main
        })
      }

      
    }
    console.log('数量:', labels.length)
    console.log(cur_range)
    //console.log(cur_labels)
    

    this.setState({
      labels: labels,
      sub_labels: sub_labels,
      charts: charts,
      cur_labels: cur_labels,
      cur_sub_labels: cur_sub_labels,
      cur_charts: cur_charts,
      indicators: cur_indicators,
      showRange: cur_range
    })
 }

  // 添加时间指示器
  addIndicator = () => {
    let {indicators, showRange, labels} = this.state
    // 选取一种新颜色
    let color = ''
    for (let i = 0 ; i < colors.length ; i++ ){
      let find = false
      for (let j = 0 ; j < indicators.length ; j++){
        if (colors[i] === indicators[j].color){
          find = true
          break
        }
      }

      if (!find){
        // 找到新颜色 结束
        color = colors[i]
        break
      }
    }
    // 生成新指示器 index 是在全局数据的索引
    let index = (showRange[0] + showRange[1]) / 2.0
    let location = showWidth / 2
    let lineShowLabels = labels.slice(showRange[0], showRange[1] + 1)
    let indicator = {id: indicators.length, color: color, left: location, labelLocation: index, main: true, labels: lineShowLabels}
    
    // 更新所有marker为副marker
    let new_indicators = []
    for (let i = 0 ; i < indicators.length ; i++){
      let item = indicators[i]
      item.main = false
      new_indicators.push(item)
    }

    // 添加当前指示器为主marker
    new_indicators.push(indicator)
    // 更新数据
    this.state.indicators = new_indicators
    this.forceUpdate()
  }

  // 删除主轴线
  removeIndicator = () => {
    let {indicators} = this.state
    let new_indicators = []
    for (let i = 0 ; i < indicators.length ; i++){
      if (!indicators[i].main){
        new_indicators.push(indicators[i])
      }
    }
    
    // 选出最左边一根为主轴
    if (new_indicators.length > 0){
      let min_left = 99999
      let index = 0
      for (let i = 0 ; i < new_indicators.length ; i++){
        if (new_indicators[i].left < min_left){
          index = i
        }
      }
      new_indicators[index].main = true
    }

    this.state.indicators = new_indicators
    this.forceUpdate()
  }

  // 子组件更新indicators
  updateIndicators = (indicators) => {
    //console.log(indicators)
    this.state.indicators = indicators
    this.forceUpdate()
  }

  // 1.1 滑动鼠标滚轮，缩放折线图。 缩放折线图展示范围
  handleScroll = (e) => {
    const ele = rdom.findDOMNode(this);
    if (e.nativeEvent.deltaY <= 0) {
      /* scrolling up 缩小区间*/
      if(ele.scrollTop <= 0) {
        //e.preventDefault();
        // 每滑动一下，区间两边同时减少一个label
        this.changeLineChartData(-5)
      }
    } else{
      /* scrolling down 扩大区间 */
      if(ele.scrollTop + ele.clientHeight >= ele.scrollHeight) {
        //e.preventDefault();
        this.changeLineChartData(5)
      }
    }
  }

  // 1.2 获取缩放折线图的比例
  changeLineChartData = (change) => {
    let {showRange, labels} = this.state
    let size = showRange[1] - showRange[0] + 1 // 区间大小
    let start = 0
    let end = 0
    let result = false
    if (change > 0){
      // 扩大区间
      start = showRange[0] - change >= 0 ? showRange[0] - change : showRange[0]
      end = showRange[1] + change <= labels.length - 1 ? showRange[1] + change : showRange[1]
      result = true
    }else {
      // 缩小区间
      if ((-1 * change) < (size / 2)){
        start = showRange[0] - change
        end = showRange[1] + change
        result = true
      }
    }

    if (result){
      this.changeRange(start, end)
    }

  }

  // 2.1 响应折线图左右移动事件
  moveChart = (e) => {
    let { moveRange} = this
    let {showRange} = this.state
    var e = e || window.event;
    let mouse_init_x = e.clientX
    let start = showRange[0]
    let end = showRange[1]
    let pre_change = 0
    
    /*鼠标的移动事件*/
    document.onmousemove = function (e) {
      //var e = e || window.event;
      //osmall.style.left = e.clientX - osmall.startX + "px";
      //osmall.style.top = e.clientY - osmall.startY + "px";
      /*对于大的DIV四个边界的判断*/
      // 计算偏移位置
      let diff = e.clientX - mouse_init_x
      let item_width = showWidth / (end - start) // 每个区间长度
      let change = Math.trunc(diff / item_width) // 只取整数
      if (pre_change != change){
        moveRange(change)
        pre_change = change
      }
    };
    /*鼠标的抬起事件,终止拖动*/
    document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;

        // 更新指示器位置
        //let start = 
        //let indicators = adjustIndicator(start, end)
        //this.state.indicators = indicators
        //this.resetIndicators(indicators)
        //console.log('拖拽结束:', start, end)
        
    };

  }

  // 2.2 计算移动后展示的区间索引 这里的change是整数 带方向
  moveRange = (change) => {
    let {indicators, showRange, labels} = this.state
    let start = showRange[0]
    let end =  showRange[1]
    let flag = false
    let rightNoShowNum = labels.length - 1 - showRange[1]
    let leftNoShowNum = showRange[0]

    if (change > 0){
      // 向右边滑动
      if (change <= leftNoShowNum){
        start -= change
        end -= change
        flag = true
      }
    }else if (change < 0){
      // 向左边滑动
      if (-change <= rightNoShowNum){
        start += -change
        end += -change
        flag = true
      }
    }

    if (flag){
      this.changeRange(start, end)
    }
  }

  // 根据区间展示范围更新展示效果
  changeRange = (start, end) => {
    let {labels, sub_labels, charts} = this.state
    let new_charts = []
    for (let i = 0 ; i < charts.length ; i++){
      let chart = JSON.parse(JSON.stringify(charts[i]))
      // 从全局数据中截取
      let values_in_new_chart = []
      for (let j = 0 ; j < chart.values.length ; j++) {
        values_in_new_chart.push({"name": chart.values[j].name, "value": chart.values[j].value.slice(start, end + 1)})
      }
      let new_chart = {
        "title": chart.title,
        values: values_in_new_chart
      }
      new_charts.push(new_chart)
    }

    // 鼠标滚动完，打印当前指示器位置
    let indicators = this.adjustIndicator(start, end)

    //console.log(indicators)
    //this.state.indicators = indicators
    this.setState({
      cur_charts: new_charts,
      indicators: indicators,
      cur_labels: labels.slice(start, end + 1),
      cur_sub_labels: sub_labels.slice(start, end + 1),
      showRange: [start, end]
    }, () => {
      
    })

  }

  // 由于缩放、滑动展示区域，导致指示器位置需要变化
  adjustIndicator = (start, end) => {
    let {labels, indicators} = this.state
    var new_indicators = []
    for (let i = 0 ; i < indicators.length ; i++) {
      let indicator = JSON.parse(JSON.stringify(indicators[i]))
      let left = '0px'
      if (indicator.labelLocation >=  start && indicator.labelLocation <= end){
        // 在展示范围内
        let itemWidth = showWidth / (end - start)
        left = (indicator.labelLocation - start) * itemWidth + 'px'
      }else{
        // 超出展示范围
        if (indicator.labelLocation > end){
          // 靠右边
          left =  showWidth + 'px'
        }else if (indicator.labelLocation < start){
          // 靠左边
          left = '0px'
        }
      }
     
      new_indicators.push({
        "id": indicator.id,
        "color": indicator.color,
        "labelLocation": indicator.labelLocation,
        "labels": labels.slice(start, end + 1),
        "left": left,
        "main": indicator.main
      })
    }
    
    return new_indicators
  }

  

  


}
