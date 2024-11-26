const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ESLintPlugin = require('eslint-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const GenericPlugin = require('./plugins/GenericPlugin');

const isDev = process.env.NODE_ENV === 'development';

/**
 * 自定义插件：在打包后运行脚本
 * done: 在 Webpack 完成构建后执行
 * beforeRun: 在 Webpack 开始构建之前执行
 */
class MyCustomPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tap('MyCustomPlugin', (stats) => {
      console.log('Webpack 打包完成，可以在这里执行自定义的脚本...');

      // 你可以在这里运行自定义脚本或做其他操作
      // 比如：读取某个文件、执行其他 Node.js 脚本等
      // fs.writeFileSync(path.resolve(__dirname, 'dist', 'customOutput.txt'), 'Webpack构建完成！');
    });
  }
}

module.exports = {
  entry: {
    test: './src/index.js',
  },
  module: {
    rules: [
      // 处理 CSS 文件
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // 使用 style-loader 和 css-loader
      },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      },
      {
        test: /\.(js|jsx)$/, // 匹配所有 js 和 jsx 文件
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // 使用 Babel loader
        },
      },
      {
        test: /\.worker\.(js|ts)$/,
        use: [
          {
            loader: 'worker-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new MyCustomPlugin(), // 使用自定义插件
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML 模板文件
    }),
    new LicenseWebpackPlugin({
      outputFilename: 'combined-licenses.txt',
    }),
    new CleanWebpackPlugin(), // 清理 dist 目录
    new GenericPlugin({
      logFilePath: path.resolve(__dirname, 'build.log'),
      message: '打包完成 执行后续操作',
    }),
    // isDev
    //   ? new ESLintPlugin({
    //       extensions: ['js', 'jsx', 'ts', 'tsx'], // 支持的文件类型
    //       fix: true, // 自动修复可修复的错误
    //     })
    //   : null,
  ],
  resolve: {
    extensions: ['.js', '.jsx'], // 解析 .js 和 .jsx 文件
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  stats: {
    children: true, // This enables detailed logging for child compilations
    // You can also enable other stats options like 'warnings' or 'errors'
  },
  // // 使用 Webpack 钩子执行额外操作
  // before: (compiler) => {
  //   console.log('Webpack 开始构建之前');
  //   // 执行你想要的操作
  // },
  // after: (compiler) => {
  //   console.log('Webpack 构建完成之后');
  //   // 执行你想要的操作
  // },
};
