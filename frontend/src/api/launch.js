import http from '../utils/request';



/**
 * 推送markers数据到后端
 */
function getList(){
  return  http("get",'/info/get', {});
}

function add(data){
  return  http("post",'/info/insert', data);
}

export {
  getList, add
}

