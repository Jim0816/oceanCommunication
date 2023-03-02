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


export default class EnergyChart extends React.Component{
    getOption =()=> {
        let option = {
          color: ['black'],
          legend: {},
          radar: [
            {
              indicator: [
                { text: '1', max: 100 },
                { text: '2', max: 100 },
                { text: '3', max: 100 },
                { text: '4', max: 100 },
                { text: '5', max: 100 },
                { text: '6', max: 100 },
                { text: '7', max: 100 },
                { text: '8', max: 100 },
                { text: '9', max: 100 },
                { text: '10', max: 100 },
                { text: '11', max: 100 },
                { text: '12', max: 100 }
              ],
              center: ['50%', '50%'],
              radius: '70%',
              nameGap: 5,
              startAngle: 90,
              splitNumber: 10,
              shape: 'circle',
              axisName: {
                formatter: '{value}',
                color: 'black',
                fontWeight: 'lighter',
                padding: [0, 0, 0, 0]
              },
              splitArea: {
                areaStyle: {
                  color: ['#428BD4'],
                  shadowColor: 'rgba(0, 0, 0, 0.1)',
                  shadowBlur: 5
                }
              },
              axisLine: {
                lineStyle: {
                  color: 'black'
                }
              },
              splitLine: {
                lineStyle: {
                  color: 'black'
                }
              }
            }
          ],
          series: [
            {
              type: 'radar',
              emphasis: {
                lineStyle: {
                  width: 4
                }
              },
              data: [
                {
                  value: [0, 50, 80, 100, 80, 50, 0, 50, 80, 100, 80, 50],
                  areaStyle: {
                    color: 'rgba(255, 228, 52, 0.6)'
                  }
                }
              ]
            }
          ]
        };
        return option
    }
  
    render(){
      return(
        <div>
          <div title="折线图表之一">
              <ReactEcharts option={this.getOption()} theme="Imooc"  style={{height:'400px'}}/>
          </div>
        </div>
      )
    }
  }
  