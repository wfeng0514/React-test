import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { TimeRange } from '../types/chart.types';
import './TimeRangeSlider.scss';

interface TimeRangeSliderProps {
  timeRange: TimeRange;
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  width?: number;
  height?: number;
}

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({ timeRange, selectedRange, onRangeChange, width = 800, height = 120 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const brushRef = useRef<d3.BrushBehavior<unknown> | null>(null);
  const isInitialized = useRef(false);
  const isDragging = useRef(false);

  // 使用本地状态来避免频繁触发父组件更新
  const [localSelectedRange, setLocalSelectedRange] = useState(selectedRange);

  // 防抖函数
  const debouncedOnRangeChange = useRef(
    debounce((range: TimeRange) => {
      onRangeChange(range);
    }, 300),
  ).current;

  // 只在 selectedRange 变化时更新本地状态
  useEffect(() => {
    if (!isDragging.current) {
      setLocalSelectedRange(selectedRange);
    }
  }, [selectedRange]);

  // 创建和更新图表
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // 只在第一次渲染或尺寸变化时完全重绘
    if (!isInitialized.current || svg.attr('width') !== width.toString() || svg.attr('height') !== height.toString()) {
      // 清除旧内容
      svg.selectAll('*').remove();

      svg.attr('width', width).attr('height', height);

      const margin = { top: 20, right: 40, bottom: 30, left: 40 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      // 创建时间比例尺
      const xScale = d3.scaleTime().domain([timeRange.start, timeRange.end]).range([0, innerWidth]);

      // 添加背景区域
      g.append('rect')
        .attr('class', 'slider-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', innerWidth)
        .attr('height', 50)
        .attr('fill', 'rgba(255, 255, 255, 0.05)')
        .attr('rx', 8)
        .attr('ry', 8);

      // 添加时间刻度
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(6)
        .tickFormat(d3.timeFormat('%m/%d %H:%M') as any);

      g.append('g')
        .attr('class', 'axis axis-time')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('fill', 'rgba(255, 255, 255, 0.7)')
        .style('font-size', '11px');

      g.selectAll('.axis path, .axis line').attr('stroke', 'rgba(255, 255, 255, 0.3)');

      // 创建刷子
      brushRef.current = d3
        .brushX()
        .extent([
          [0, 10],
          [innerWidth, innerHeight - 10],
        ])
        .on('start', () => {
          isDragging.current = true;
        })
        .on('brush', (event) => {
          if (!event.selection) return;

          const [start, end] = event.selection;

          // 限制最小选择范围
          const minWidth = innerWidth * 0.1;
          if (end - start < minWidth) {
            if (brushRef.current) {
              brushRef.current.move(g.select('.brush'), [start, start + minWidth]);
            }
            return;
          }

          const newStart = xScale.invert(start);
          const newEnd = xScale.invert(end);

          // 更新本地状态
          setLocalSelectedRange({ start: newStart, end: newEnd });

          // 更新标签
          updateLabels(g, start, end, innerHeight, newStart, newEnd);
        })
        .on('end', (event) => {
          isDragging.current = false;

          if (!event.selection) {
            // 如果没有选择，恢复之前的范围
            if (brushRef.current) {
              const selectionStart = xScale(selectedRange.start);
              const selectionEnd = xScale(selectedRange.end);
              brushRef.current.move(g.select('.brush'), [selectionStart, selectionEnd]);
            }
            return;
          }

          const [start, end] = event.selection;
          const newStart = xScale.invert(start);
          const newEnd = xScale.invert(end);

          // 使用防抖调用父组件的回调
          debouncedOnRangeChange({ start: newStart, end: newEnd });
        });

      // 添加刷子组
      const brushGroup = g.append('g').attr('class', 'brush').call(brushRef.current);

      // 设置初始刷子位置
      const initialStart = xScale(selectedRange.start);
      const initialEnd = xScale(selectedRange.end);

      if (brushRef.current) {
        brushRef.current.move(brushGroup, [initialStart, initialEnd]);
      }

      // 自定义刷子样式
      brushGroup.selectAll('.selection').attr('stroke', 'none').attr('fill', 'rgba(79, 195, 247, 0.3)');

      brushGroup.selectAll('.handle').attr('fill', '#4fc3f7').attr('stroke', '#fff').attr('stroke-width', 2).attr('rx', 4).attr('ry', 4);

      // 添加标签组
      const labelGroup = g.append('g').attr('class', 'range-labels');

      // 初始化标签
      updateLabels(g, initialStart, initialEnd, innerHeight, selectedRange.start, selectedRange.end);

      isInitialized.current = true;
    } else {
      // // 只更新刷子位置而不重绘整个图表
      // const svg = d3.select(svgRef.current);
      // const g = svg.select('g');
      // const xScale = d3
      //   .scaleTime()
      //   .domain([timeRange.start, timeRange.end])
      //   .range([0, width - 80]); // 减去 margin
      // const brushGroup = g.select('.brush');
      // const newStart = xScale(selectedRange.start);
      // const newEnd = xScale(selectedRange.end);
      // if (brushRef.current && brushGroup && !isDragging.current) {
      //   brushRef.current.move(brushGroup, [newStart, newEnd]);
      //   // 更新标签
      //   const innerHeight = height - 50; // 减去 margin
      //   updateLabels(g, newStart, newEnd, innerHeight, selectedRange.start, selectedRange.end);
      // }
    }
  }, [timeRange, selectedRange, width, height, debouncedOnRangeChange]);

  // 更新标签的函数
  const updateLabels = (g: d3.Selection<SVGGElement, unknown, null, undefined>, start: number, end: number, innerHeight: number, startDate: Date, endDate: Date) => {
    const labelGroup = g.select('.range-labels');
    labelGroup.selectAll('*').remove();

    const labelWidth = 90;
    const labelHeight = 24;

    // 开始时间标签
    labelGroup
      .append('rect')
      .attr('class', 'label-bg label-start')
      .attr('x', start - labelWidth / 2)
      .attr('y', -labelHeight - 5)
      .attr('width', labelWidth)
      .attr('height', labelHeight)
      .attr('fill', 'rgba(79, 195, 247, 0.2)')
      .attr('stroke', 'rgba(79, 195, 247, 0.5)')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4);

    labelGroup
      .append('text')
      .attr('class', 'label-text')
      .attr('x', start)
      .attr('y', -labelHeight + 12)
      .attr('text-anchor', 'middle')
      .style('fill', '#4fc3f7')
      .style('font-size', '11px')
      .text(d3.timeFormat('%m/%d %H:%M')(startDate));

    // 结束时间标签
    labelGroup
      .append('rect')
      .attr('class', 'label-bg label-end')
      .attr('x', end - labelWidth / 2)
      .attr('y', -labelHeight - 5)
      .attr('width', labelWidth)
      .attr('height', labelHeight)
      .attr('fill', 'rgba(79, 195, 247, 0.2)')
      .attr('stroke', 'rgba(79, 195, 247, 0.5)')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4);

    labelGroup
      .append('text')
      .attr('class', 'label-text')
      .attr('x', end)
      .attr('y', -labelHeight + 12)
      .attr('text-anchor', 'middle')
      .style('fill', '#4fc3f7')
      .style('font-size', '11px')
      .text(d3.timeFormat('%m/%d %H:%M')(endDate));
  };

  // 处理重置按钮
  const handleReset = useCallback(() => {
    onRangeChange(timeRange);
  }, [timeRange, onRangeChange]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').remove();
      }
      isInitialized.current = false;
    };
  }, []);

  return (
    <div className="time-range-slider">
      <div className="slider-header">
        <h3>时间范围选择器</h3>
        <p>拖动滑块两侧手柄调整查看的时间范围</p>
      </div>
      <svg ref={svgRef}></svg>
      <div className="slider-actions">
        {/* <button className="btn-reset" onClick={handleReset}>
          重置为完整范围
        </button> */}
        <div className="range-info">
          <span>当前范围: </span>
          <span className="range-text">
            {d3.timeFormat('%Y-%m-%d %H:%M')(selectedRange.start)}至{d3.timeFormat('%Y-%m-%d %H:%M')(selectedRange.end)}
          </span>
        </div>
      </div>
    </div>
  );
};

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

export default TimeRangeSlider;
