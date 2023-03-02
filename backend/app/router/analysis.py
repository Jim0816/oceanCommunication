from fastapi import APIRouter, File, UploadFile
import os
import datetime
import numpy as np

from app.models.DBmanage import DBManage
import time

router = APIRouter()

tmp_dir_path = "app/router/tmp"

@router.get("/analysis/", tags=["analysis"])
async def main():
    return {"message": "Analysis router"}

# 上传文件，返回是否需要替换
@router.post("/analysis/upload", tags=["analysis", "fileIO"])
async def fileUpload(file: UploadFile = File(...)):
    contents = await file.read()
    # print(os.getcwd())
    path = os.path.join(tmp_dir_path, file.filename)
    with open(path, "wb") as f:
        f.write(contents)

    # 清空数据库命令
    # DBManage.clear_db()
    timer1 = time.time()
    replace = await DBManage.read_one(path)
    print('读取写入文件总时间：', time.time() - timer1)

    if replace:
        # 需要替换暂时保留tmp临时文件
        return {'replace': True}
    else:
        # 不需要替换则删除tmp临时文件
        os.remove(path)
        return {'replace': False}

# 处理前端返回的是否替换命令
# 取消替换则删除临时文件
# 需要替换则替换后再删除临时文件
@router.get("/analysis/replace/", tags=["analysis", "fileIO"])
async def fileReplace(replace: bool = False):
    del_list = os.listdir(tmp_dir_path)
    for f in del_list:
        file_path = os.path.join(tmp_dir_path, f)
        if replace:
            await DBManage.read_one(file_path, replace=True)
        if os.path.isfile(file_path):
            os.remove(file_path)
    return {"status": "done"}

# 清空数据库
@router.get("/analysis/clear", tags = ["analysis", "fileIO"])
async def clearDB():
    await DBManage.clear_db()
    return {"data": True}

# 数据库起止时间
@router.get("/analysis/db-start-end-time", tags = ["analysis", "dataIO"])
async def DBStartEndTime():
    db_start_time, db_end_time = await DBManage.get_db_start_end_time()
    db_start_time = datetime.datetime.strftime(db_start_time, "%Y-%m-%d %H:%M:%S")
    db_end_time = datetime.datetime.strftime(db_end_time, "%Y-%m-%d %H:%M:%S")
    res = {
        "db_start_time": db_start_time,
        "db_end_time": db_end_time,
    }
    return res

# 时域数据
@router.get("/analysis/time-domain-data", tags = ["analysis", "dataIO"])
async def timeDomainData(db_start_time: str, db_end_time: str):
    start_time = datetime.datetime.strptime(db_start_time, "%Y-%m-%d %H:%M:%S")
    end_time = datetime.datetime.strptime(db_end_time, "%Y-%m-%d %H:%M:%S")
    time, sample, channel1, channel2, amplitude = await DBManage.search_by_time(start_time, end_time)
    res = {
        "time": time,
        "sample": sample,
        "channel1": channel1,
        "channel2": channel2,
        "amplitude": amplitude
    }
    return res

# 3D时频分析数据
@router.get("/analysis/frequency-domain-data", tags = ["analysis", "dataIO"])
async def frequencyDomainData(coord1: int, coord2: int):
    res = await DBManage.get_brush_data(coord1, coord2)
    time = [datetime.datetime.strftime(x["time"], "%Y-%m-%d %H:%M:%S") for x in res]
    sample = [x["sample"] for x in res]
    amplitude = [x["amplitude"] for x in res]
    frequency = [x["frequency"] for x in res]

    res = [[time[i] + " " + str(sample[i]), amplitude[i], frequency[i]] for i in range(len(time))]
    
    res.insert(0, ["时间 采样点", "时域幅度", "频域幅度"])
    return {"data": res}

# 2D热力图数据
@router.get("/analysis/thermodynamic-data", tags = ["analysis", "dataIO"])
async def thermodynamicData(mode: int, coord1: int, coord2: int):
    
    timer1 = time.time()
    res = await DBManage.get_brush_heatmap_data(coord1, coord2)
    print('请求热力图数据时间：', time.time() - timer1)
    return {'data': res.tolist()} 
    
    res = await DBManage.get_brush_data(coord1, coord2)
    amplitude = [x["amplitude"] for x in res]
    if mode == 0:
        data = [x["frequency"] for x in res]
        tmp = []
        ma = float(format(max(amplitude), '.4f'))
        mi = float(format(min(amplitude), '.4f'))
        if (ma == 0 and mi == 0):
            return {"data": []}
        # print(ma, mi)
        amp_range = int((ma - mi) / 0.0001)
        for i in range(len(res)):
            for j in range(amp_range + 2):
                tmp.append([float(format((i / 1024), '.2f')), float(format(mi + j * 0.0001, '.4f')), np.min(np.array(data))])
        res = tmp + [[float(format((i / 1024), '.2f')), float(format(amplitude[i], '.4f')), data[i]] for i in range(len(res))]
        # 如果包含部分为0 返回空集合
        if (len(res) > 100000):
            return {"data": []}
        # print(res)
        # 热力图要求两个轴均为类目轴，所以进行约简，会有相同的位置，相同的位置会覆盖
        # tmp是先进行顺序位置的置零，否则纵轴不是按照正常的顺序排列

    # elif mode == 1:
    #     data = pywt.wavedec()

    return {"data": res}

# 数据处理进度
@router.get("/analysis/progress", tags = ["analysis"])
async def getProgress():
    res = DBManage.get_progress()
    print(res)
    return {'data': '11111'}