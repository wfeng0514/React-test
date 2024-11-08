onmessage = function(event) {
  const numbers = event.data;  // 获取主线程传递的数据
  const results = numbers.map(num => num * num);  // 计算平方
  postMessage(results);  // 将计算结果返回主线程
};