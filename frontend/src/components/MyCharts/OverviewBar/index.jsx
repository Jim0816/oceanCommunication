import React, { Component } from 'react'
import OverviewBar from './index.module.css'
import LineArea from '../../Echarts/lineArea'
export default class index extends Component {

  state = {
    overviewBarLeftBorder: 0,
    overviewBarWidth: 0
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // 初始化折线图和总览图边界、位置
   let obj = document.getElementById('overview-container')
   let overviewBarLeftBorder = obj.getBoundingClientRect().left
   let overviewBarWidth = obj.offsetWidth


   // 注意：通过setState() 形式修改状态会触发render() 
   this.state.overviewBarWidth = overviewBarWidth
   this.state.overviewBarLeftBorder = overviewBarLeftBorder
  }

  render() {
    // 获取状态数据
    let {showRange, indicators, labels, sub_labels, charts, width, height} = this.props
    let {overviewBarWidth, overviewBarLeftBorder} = this.state
    // 计算下方透明部分区域
    let overviewObj = document.getElementById('overview-container')
    let showLeft = (showRange[0] / (labels.length - 1)) * 100 + '%'
    let showWidth = ((showRange[1] - showRange[0]) / (labels.length - 1)) * 100 + '%'
    return (
      <div id="overview-container" className={OverviewBar.container}>
        <div className={OverviewBar.chartBox}>
          <LineArea width={width} labels={labels} sub_labels={sub_labels} charts={charts}/>
        </div>
        
          {/* 阴影面积 */}
          <div className={OverviewBar.showAreaBox}>
            <div className={OverviewBar.showArea} style={{left: showLeft, width: showWidth}}></div>
          </div>
          
          {indicators.map(
            (indicator, id) => {
              // indicator.labelLocation 表示全局数据中横坐标索引
                let index = Math.trunc(indicator.labelLocation / 1)
                // 位于当前区间的百分之多少位置
                let decimal = indicator.labelLocation % 1
                // 计算全局中每个区间长度
                let itemWidth = overviewBarWidth / (labels.length - 1)
                let left = itemWidth * (index + decimal) + 'px'
                return (
                  <div key={id} className={OverviewBar.indicator} style={{left: left, backgroundColor: indicator.color}}></div>
                )
            }
          )}
      </div>
    )
  }
}
