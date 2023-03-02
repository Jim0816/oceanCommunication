from fastapi import APIRouter, WebSocket
import time

from app.models.DBmanage import DBManage
# from app.test.DBmanage import DBManage

router = APIRouter()

@router.websocket("/raw")
async def rawData(ws: WebSocket):
    await ws.accept()
    while True:
        data = await DBManage.get_ABC_data(sec = 10) # 获取的秒数，即最新的sec秒数据，每秒1024个数据
        # print(data)
        await ws.send_json(data)
        time.sleep(1) # 间隔秒数发送数据