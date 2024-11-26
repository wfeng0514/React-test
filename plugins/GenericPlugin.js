// plugins/GenericPlugin.js
const fs = require('fs');
const path = require('path');

class GenericPlugin {
  constructor(options = {}) {
    // 插件配置，默认值
    this.options = {
      logFilePath: path.resolve(__dirname, 'build.log'), // 默认日志路径
      message: 'Webpack Build Completed!', // 默认日志消息
      ...options, // 合并用户传入的配置
    };
  }

  // 必须实现的 `apply` 方法
  apply(compiler) {
    // 监听构建开始事件
    compiler.hooks.compile.tap('GenericPlugin', (params) => {
      console.log('构建开始：', new Date().toLocaleString());
    });

    // 监听构建完成事件
    compiler.hooks.done.tap('GenericPlugin', (stats) => {
      const endTime = new Date();
      const startTime = stats.startTime;
      const duration = endTime - startTime;

      // 输出到控制台
      console.log(this.options.message);
      console.log(`构建耗时: ${duration}ms`);

      // 将构建日志写入到指定文件
      const logMessage = `
        ----------------------------------------
        构建完成: ${new Date().toLocaleString()}
        构建耗时: ${duration}ms
        ----------------------------------------
      `;
      fs.appendFileSync(this.options.logFilePath, logMessage, 'utf-8');
      console.log(`日志已写入到：${this.options.logFilePath}`);
    });
  }
}

module.exports = GenericPlugin;
