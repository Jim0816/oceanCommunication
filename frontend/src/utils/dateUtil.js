/**
 * 日期格式转换
 * @param millisecond 毫秒
 * @param template 模板(可选)
 * @example formatDate(new Date(), "YYYY-mm-dd HH:MM:SS") => 2021-11-02 09:39:59
 */
 function formatDate(millisecond, template) {
    var res = "";
    try {
      var date = new Date(millisecond);
      var opt = {
        "Y+": date.getFullYear().toString(), // 年
        "m+": (date.getMonth() + 1).toString(), // 月
        "d+": date.getDate().toString(), // 日
        "H+": date.getHours().toString(), // 时
        "M+": date.getMinutes().toString(), // 分
        "S+": date.getSeconds().toString(), // 秒
      };
      template = template || "YYYY-mm-dd";
      for (var k in opt) {
        var ret = new RegExp("(" + k + ")").exec(template);
        if (ret) {
          template = template.replace(
            ret[1],
            ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
          );
        }
      }
      res = template;
    } catch (error) {
      console.warn("ERROR formatDate", error);
    }
    return res;
  }
  

// 获取当前时间: 年、月、日、时、分、秒、毫秒、纳秒
const get_date_detail = () => {
    var date = new Date()
    return [date.getFullYear().toString(), 
        (date.getMonth() + 1).toString(), 
        date.getDate().toString(), 
        date.getHours().toString(), 
        date.getMinutes().toString(), 
        date.getSeconds().toString(), 
        date.getMilliseconds().toString(),
        '000',
        '000'
    ];
}

const getLocalDateTime = () => {
    return formatDate(new Date(), "YYYY-mm-dd HH:MM:SS")  // 2021-11-02 09:39:59
}




module.exports = {
    get_date_detail : get_date_detail,
    getLocalDateTime: getLocalDateTime 
}