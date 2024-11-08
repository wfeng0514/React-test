import React, { useState, useEffect } from 'react';

const ProgressCircle = (props) => {
  const { progress, size, strokeWidth, color } = props;

  // 圆的半径
  const radius = (size - strokeWidth) / 2;
  // 圆的周长
  const circumference = 2 * Math.PI * radius;
  // 计算进度的偏移量
  const offset = circumference - (progress / 100) * circumference;

  let config = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    strokeWidth: strokeWidth,
    fill: 'none',
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        {...config}
        stroke="#e6e6e6" // 背景圆的颜色
      />
      <circle
        {...config}
        stroke={color} // 进度条颜色
        strokeDasharray={circumference} // 设置总长度
        strokeDashoffset={offset} // 动态调整进度
        strokeLinecap="round" // 设置圆角线帽
        style={{ transition: 'stroke-dashoffset 1s ease' }} // 过渡效果
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20" fill="black">
        {progress}%
      </text>
    </svg>
  );
};

/**
 * 进度环
 */
export default function Index() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(70);
    return () => setProgress(0);
  }, []);

  return <ProgressCircle progress={progress} size={150} strokeWidth={15} color="red" />;
}
