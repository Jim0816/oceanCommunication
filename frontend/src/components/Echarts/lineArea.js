import React from 'react';
// import {Card} from 'antd';
//不是按需加载的话文件太大
//import echarts from 'echarts'
//下面是按需加载
//import echarts from 'echarts/lib/echarts'
//导入折线图
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/markPoint';
import ReactEcharts from 'echarts-for-react';


export default class LineArea extends React.Component{
    
    render(){
      const {labels, sub_labels, charts} = this.props
      const option = this.getOption()
      return(
        <div style={{width: this.props.width + 'px', height: '100%'}}>
          <div>
            <ReactEcharts option={option} theme="Imooc"  style={{width: this.props.width + 'px', height:'100%'}}/>
          </div>
          
        </div>
      )
    }

    // 自定义方法
    getOption =()=> {
      const {labels, sub_labels, charts} = this.props
      //console.log('孙子组件渲染...', labels)
      var newSeries = []
      for (let i = 0 ; i < charts.length && i < 1 ; i++){
        // 每一个折线图数据
        let chart = charts[i]
        let list = chart.values
        for (let j = 0 ; j < list.length ; j++) {
          let item = {
            data: list[j].value,
            type: 'line',
            itemStyle : {  
              normal : {
                  color: j == 0 ?'red' : 'green',  
                  lineStyle:{  
                      color: j == 0 ?'red' : 'green'
                  }  
              }  
          },  
          }
          newSeries.push(item)
        }
      }


      let option = {
          xAxis: [
            {
              type: 'category',
              position: 'bottom',
              boundaryGap: false,
              data: labels
            },
            {
              type: 'category',
              position: 'top',
              boundaryGap: false,
              data: sub_labels
            }
          ],
          yAxis: {
            type: 'value'
          },
          grid: {
              top: '22%',
              left: '0%',
              right: '0%',
              bottom: '50%'
          },
          series: newSeries
        };
      return option
  }
}
  