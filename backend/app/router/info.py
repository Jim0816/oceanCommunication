from fastapi import APIRouter
from typing import Union
import datetime

from pydantic import BaseModel
from app.models.DBmanage import DBManage


router = APIRouter()

# 前端请求体
class InfoList(BaseModel):
    data: list
    '''
    样例：
    {
    data:
        [
            {"id":0,"name":"发射机A", "lng": 109.91, "lat": 21.08, "angle": 0, "time": "2022-06-01 13:00:00", "location": "宜昌"},
            {"id":0,"name":"发射机B", "lng": 109.91, "lat": 21.08, "angle": 0, "time": "2022-06-01 13:00:00", "location": "宜昌"}
        ]
    }
    '''

# 暂时没用
# class InfoIndex(BaseModel):
#     start_time: Union[str, None] = None   # 开始时间, "20220601130000", "YYYYmmddHHMMSS"
#     end_time: Union[str, None] = None     # 结束时间, "20220601130000", "YYYYmmddHHMMSS"
#     number: int = 100                     # 检索条目数，5个为一组
#     form: str = None                      # 计算形式
#     alg: str = None                       # 计算算法

# 插入数据接口
@router.post("/info/insert", tags=["info"])
async def insertInfo(info: InfoList):
    if len(info.data) != 5:
        return {'result': -1}
    
    time = datetime.datetime.strptime(info.data[0]['time'], "%Y-%m-%d %H:%M:%S")
    time_s = datetime.datetime.strftime(time, "%Y%m%d%H%M%S")
    filename = "实时数据_{}".format(time_s)

    data = {
        "filename": filename,
        "time": time,
        "content": info.data
    }
    await DBManage.insert_info(data)
    return {"result": 1}

# 获取信息接口
@router.get("/info/get", tags=["info"])
async def getInfo(num: int = 10):
    data = await DBManage.get_filenames(num)
    return data

# 获取热力图数据
@router.get("/info/heatmap", tags=["info"])
async def getHeatmap(start_time = "2022-9-2 11:26:00", end_time = "2022-9-2 11:27:44"):
    data = await DBManage.get_ABC_heatmap_data(start_time=start_time, end_time=end_time, col_name="testColC", channel="channel1", critical_frequencies=32)
    return data


# 清空info数据集合
@router.get("/info/clear", tags=["info"])
async def clearInfo():
    await DBManage.clear_info()
    return {'result': 1}
