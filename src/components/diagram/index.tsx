import React, { useState, useCallback } from 'react';
import TimeSeriesChart from '@/components/diagram/TimeSeriesChart/TimeSeriesChart';
import TimeRangeSlider from '@/components/diagram/TimeRangeSlider/TimeRangeSlider';
import Legend from '@/components/diagram/Legend/Legend';
import { useTimeSeriesData } from '@/components/diagram/hooks/useTimeSeriesData';
import { ChartDimensions, CurveConfig, TimeRange } from '@/components/diagram/types/chart.types';
import './index.scss';

function Diagram() {
  const { allData, filteredData, timeRange, filterData, refreshData } = useTimeSeriesData(30);

  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRange);
  const [curves, setCurves] = useState<CurveConfig[]>([
    {
      id: 'avgDuration',
      label: '平均时长',
      color: '#4fc3f7',
      strokeWidth: 3,
      visible: true,
    },
    {
      id: 'timeoutThreshold',
      label: '超时阈值',
      color: '#ff4081',
      strokeWidth: 2,
      strokeDasharray: '5,5',
      visible: true,
    },
    {
      id: 'targetDuration',
      label: '目标时长',
      color: '#69f0ae',
      strokeWidth: 2,
      strokeDasharray: '10,5',
      visible: true,
    },
  ]);

  const chartDimensions: ChartDimensions = {
    width: 1000,
    height: 500,
    margin: { top: 40, right: 40, bottom: 60, left: 60 },
  };

  const handleRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedRange(range);
      filterData(range);
    },
    [filterData],
  );

  const handleToggleCurve = useCallback((id: string) => {
    setCurves((prev) => prev.map((curve) => (curve?.id === id ? { ...curve, visible: !curve.visible } : curve)));
  }, []);

  const handleRefreshData = () => {
    refreshData(30);
    setSelectedRange(timeRange);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 时间序列圆曲线监控系统</h1>
        <p className="app-subtitle">实时监控系统响应时间，使用D3.js可视化时间序列数据</p>
      </header>

      <main className="app-main">
        <div className="dashboard">
          <div className="dashboard-row">
            <div className="dashboard-col chart-col">
              <TimeSeriesChart data={filteredData} dimensions={chartDimensions} curves={curves} onZoom={handleRangeChange} />
            </div>
            {/* <div className="dashboard-col legend-col">
              <Legend curves={curves} onToggle={handleToggleCurve} />
              <div className="data-controls">
                <h4>数据控制</h4>
                <button className="btn-refresh" onClick={handleRefreshData}>
                  🔄 刷新数据
                </button>
                <div className="stats">
                  <div className="stat-item">
                    <span className="stat-label">数据点数:</span>
                    <span className="stat-value">{filteredData.avgDuration.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">时间范围:</span>
                    <span className="stat-value">
                      {new Date(selectedRange.start).toLocaleDateString()} -{new Date(selectedRange.end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          <div className="dashboard-row">
            <div className="dashboard-col full-col">
              <TimeRangeSlider timeRange={timeRange} selectedRange={selectedRange} onRangeChange={handleRangeChange} />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2024 时间序列可视化系统 | 使用 D3.js + React + TypeScript 构建</p>
        <div className="footer-links">
          <span>曲线说明: </span>
          <span className="link-item">平均时长 - 系统实际响应时间</span>
          <span className="link-item">超时阈值 - 系统设定的超时限制</span>
          <span className="link-item">目标时长 - 期望达到的性能目标</span>
        </div>
      </footer>
    </div>
  );
}

export default Diagram;
