import { useState, useEffect, useCallback } from 'react';
import { TimeSeriesData, TimeSeriesPoint, TimeRange } from '../types/chart.types';

// 生成模拟数据
const generateMockData = (days: number = 30): TimeSeriesData => {
  const data: TimeSeriesData = {
    avgDuration: [],
    timeoutThreshold: [],
    targetDuration: [],
  };

  const now = new Date();
  const baseDate = new Date(now);
  baseDate.setDate(baseDate.getDate() - days);

  for (let i = 0; i < days * 24; i++) {
    // 每小时一个点
    const timestamp = new Date(baseDate);
    timestamp.setHours(timestamp.getHours() + i);

    const hourInDay = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();
    const progress = i / (days * 24);

    // 平均时长 - 有昼夜和周末模式
    let avgValue = 200;
    avgValue += Math.sin(progress * Math.PI * 2) * 50; // 长期趋势
    avgValue += Math.sin((hourInDay * Math.PI) / 12) * 30; // 昼夜波动
    avgValue += dayOfWeek === 0 || dayOfWeek === 6 ? 40 : 0; // 周末偏高
    avgValue += (Math.random() - 0.5) * 20; // 随机噪声

    // 超时阈值 - 阶梯式，偶尔调整
    let thresholdValue = 400;
    if (i % (7 * 24) === 0) thresholdValue += (Math.random() - 0.5) * 50; // 每周可能调整
    thresholdValue += Math.random() * 10; // 小波动

    // 目标时长 - 逐步优化
    let targetValue = 180 - Math.floor(progress * 10) * 10;
    targetValue += Math.sin(progress * Math.PI * 4) * 15; // 短期波动

    data.avgDuration.push({ timestamp, value: Math.max(50, avgValue) });
    data.timeoutThreshold.push({
      timestamp,
      value: Math.max(200, thresholdValue),
    });
    data.targetDuration.push({ timestamp, value: Math.max(50, targetValue) });
  }

  return data;
};

export const useTimeSeriesData = (initialDays: number = 30) => {
  const [allData, setAllData] = useState<TimeSeriesData>(generateMockData(initialDays));
  const [filteredData, setFilteredData] = useState<TimeSeriesData>(allData);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: allData.avgDuration[0]?.timestamp || new Date(),
    end: allData.avgDuration[allData.avgDuration.length - 1]?.timestamp || new Date(),
  });

  // 过滤数据
  const filterData = useCallback(
    (range: TimeRange) => {
      const filterPoints = (points: TimeSeriesPoint[]) => points.filter((p) => p.timestamp >= range.start && p.timestamp <= range.end);

      setFilteredData({
        avgDuration: filterPoints(allData.avgDuration),
        timeoutThreshold: filterPoints(allData.timeoutThreshold),
        targetDuration: filterPoints(allData.targetDuration),
      });
      setTimeRange(range);
    },
    [allData],
  );

  // 初始过滤
  useEffect(() => {
    const start = allData.avgDuration[0]?.timestamp;
    const end = allData.avgDuration[allData.avgDuration.length - 1]?.timestamp;
    if (start && end) {
      filterData({ start, end });
    }
  }, [allData, filterData]);

  const refreshData = (days: number) => {
    const newData = generateMockData(days);
    setAllData(newData);
  };

  return {
    allData,
    filteredData,
    timeRange,
    filterData,
    refreshData,
  };
};
