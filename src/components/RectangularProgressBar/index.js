import React, { useState, useEffect } from 'react';

/**
 * 矩形进度条
 */
const RectangularProgressBar = ({ progress }) => {
  const styles = {
    container: {
      width: '100%',
      height: '30px', // 设置进度条的高度
      backgroundColor: '#e0e0e0', // 进度条背景颜色
      borderRadius: '5px', // 圆角效果
      overflow: 'hidden', // 防止进度条溢出
    },
    progressBar: {
      height: '100%',
      backgroundColor: '#4caf50', // 进度条颜色
      transition: 'width 0.5s ease-in-out', // 进度条平滑过渡效果
    },
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={styles.container}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>
      <div>当前进度: {progress}%</div>
    </div>
  );
};

const Index = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(70);
    return () => setProgress(0);
  }, []);

  return <RectangularProgressBar progress={progress} />;
};

export default Index;
