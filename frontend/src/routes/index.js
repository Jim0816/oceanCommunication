

// 导入自定义页面组件
import Login from '../pages/Login'
import Home from '../pages/Home'
import Error from '../pages/Error'
import About from '../pages/About'
import Receipt from '../pages/Receipt'
import Launch from '../pages/Launch'
import Interaction from '../pages/Interaction'
import FFT from '../pages/FFT'
import HotChart from '../pages/HotChart'
import logo1 from './logo1.png'
import logo2 from './logo2.png'
import logo3 from './logo3.png'
import logo4 from './logo4.png'
import ReactTooltip from 'react-tooltip';

export const mainRoutes = [
    {
        path: '/login',
        title: '登陆',
        component: Login
    },
    {
        path: '/404',
        title: '错误',
        component: Error
    }
]


export const adminRoutes = [
    {
        path: '/admin/launch',
        title: '发射端与系统',
        component: Launch,
        exact: true,
        isShow: true,
        icon: 'shop',
        logo: <><img src={logo1} style={{ height: "42px", width: "42px" }} data-tip="发射端与系统" data-type={'light'} data-place={"right" }></img><ReactTooltip /></>
    },
    {
        path: '/admin/receipt',
        title: '接收分析',
        component: Receipt,
        exact: true,
        isShow: true,
        icon: 'shop',
        logo: <><img src={logo2} style={{ height: "42px", width: "42px" }} data-tip="接收分析" data-type={'light'} data-place={"right"}></img><ReactTooltip /></>
    },
    {
        path: '/admin/hotChart',
        title: '计算分析',
        component: HotChart,
        exact: true,
        isShow: true,
        icon: 'shop',
        logo: <><img src={logo3} style={{ height: "42px", width: "42px" }} data-tip="计算分析" data-type={'light'} data-place={"right"} ></img><ReactTooltip /></>
    },

    {
        path: '/admin/interaction',
        title: '后台数据与交互管理',
        component: Interaction,
        exact: true,
        isShow: true,
        icon: 'shop',
        logo: <><img src={logo4} style={{ height: "42px", width: "42px" }} data-tip="后台数据与交互管理" data-type={'light'} data-place={"right"}></img><ReactTooltip /></>
    },
]