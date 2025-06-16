const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin'); // HTML 插件,用于生成 HTML 文件,并自动引入打包后的 JS 文件
// const ESLintPlugin = require('eslint-webpack-plugin');// ESLint 插件，用于在 Webpack 构建过程中进行 ESLint 检查
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin; // 许可证插件，用于生成许可证文件
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); // 清理插件，用于清理构建目录
const GenericPlugin = require('./plugins/GenericPlugin'); // 自定义插件

const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // CSS 提取插件，用于将 CSS 提取到单独的文件中
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin'); // CSS 最小化插件，用于压缩 CSS 文件
const TerserPlugin = require('terser-webpack-plugin'); // JavaScript 压缩插件，用于压缩 JavaScript 文件
// const CopyWebpackPlugin = require('copy-webpack-plugin'); // 文件复制插件，用于复制文件

// const isDev = process.env.NODE_ENV === 'development';

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
    profile: './src/index.js',
  },
  module: {
    rules: [
      // 处理 CSS 文件
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, // 提取 CSS 到独立文件
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader, // 提取 CSS 到独立文件
          'css-loader',
          'sass-loader',
        ],
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
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件的扩展名
        type: 'asset/resource', // 使用内建的 resource 处理
        generator: {
          filename: 'imgs/[name][ext]', // 输出文件名，包含文件名、哈希值和扩展名
        },
      },
    ],
  },
  plugins: [
    require('autoprefixer'), // 自动添加浏览器前缀
    new MyCustomPlugin(), // 使用自定义插件
    new HtmlWebpackPlugin({
      template: './public/index.html', // HTML 模板文件
      favicon: './public/favicon.ico', // 图标路径
    }),
    new LicenseWebpackPlugin({
      outputFilename: 'combined-licenses.txt',
    }),
    new CleanWebpackPlugin(), // 清理 dist 目录
    new GenericPlugin({
      logFilePath: path.resolve(__dirname, 'build.log'),
      message: '打包完成 执行后续操作',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css', // 输出的 CSS 文件名
    }),
    // new CopyWebpackPlugin({
    //   patterns: [
    //     {
    //       // 从public中复制文件
    //       from: path.resolve(__dirname, 'public/imgs'),
    //       // 把复制的文件存放到dist里面
    //       to: path.resolve(__dirname, 'dist/imgs'),
    //     },
    //   ],
    // }),
    // isDev
    //   ? new ESLintPlugin({
    //       extensions: ['js', 'jsx', 'ts', 'tsx'], // 支持的文件类型
    //       fix: true, // 自动修复可修复的错误
    //     })
    //   : null,
  ],
  optimization: {
    minimize: true, // 启用压缩
    minimizer: [
      new TerserPlugin(), // 压缩 JS
      new CssMinimizerPlugin(), // 使用 css-minimizer-webpack-plugin 压缩 CSS
    ],
  },
  output: {
    clean: true, // 清理输出目录
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss', '.ts', '.tsx'], // 自动解析 .js 和 .jsx 文件
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devtool: 'source-map', // 开发环境使用 source map
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
