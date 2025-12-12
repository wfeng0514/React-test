import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TimeSeriesData, ChartDimensions, CurveConfig, TimeSeriesPoint } from '../types/chart.types';
import './TimeSeriesChart.scss';

interface TimeSeriesChartProps {
  data: TimeSeriesData;
  dimensions: ChartDimensions;
  curves: CurveConfig[];
  onZoom?: (range: { start: Date; end: Date }) => void;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, dimensions, curves, onZoom }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const { width, height, margin } = dimensions;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // 清除旧图表
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 获取所有时间点
    const allTimestamps = [...data.avgDuration.map((d) => d.timestamp), ...data.timeoutThreshold.map((d) => d.timestamp), ...data.targetDuration.map((d) => d.timestamp)];

    // 计算值域
    const allValues = [...data.avgDuration.map((d) => d.value), ...data.timeoutThreshold.map((d) => d.value), ...data.targetDuration.map((d) => d.value)];

    // 创建比例尺
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(allTimestamps) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(allValues) || 100])
      .range([innerHeight, 0])
      .nice();

    // 创建坐标轴
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(8)
      .tickFormat(d3.timeFormat('%m/%d %H:%M') as any);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(8)
      .tickFormat((d) => `${d}ms`);

    // 绘制网格
    g.append('g')
      .attr('class', 'grid grid-x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(8)
          .tickSize(-innerHeight)
          .tickFormat(() => ''),
      )
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-dasharray', '3,3');

    g.append('g')
      .attr('class', 'grid grid-y')
      .call(
        d3
          .axisLeft(yScale)
          .ticks(8)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .selectAll('line')
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-dasharray', '3,3');

    // 绘制坐标轴
    g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('font-size', '12px');

    g.append('g').attr('class', 'axis axis-y').call(yAxis).selectAll('text').style('fill', 'rgba(255, 255, 255, 0.7)').style('font-size', '12px');

    // 坐标轴线样式
    g.selectAll('.axis path, .axis line').attr('stroke', 'rgba(255, 255, 255, 0.3)');

    // 定义曲线生成器
    const lineGenerator = d3
      .line<TimeSeriesPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // 绘制每条曲线
    curves.forEach((config) => {
      if (!config.visible) return;

      const curveData = data[config.id];
      if (!curveData.length) return;

      // 绘制曲线
      g.append('path')
        .datum(curveData)
        .attr('class', `curve curve-${config.id}`)
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', config.color)
        .attr('stroke-width', config.strokeWidth)
        .attr('stroke-dasharray', config.strokeDasharray || 'none')
        .style('filter', 'url(#glow)');

      // 绘制数据点
      g.selectAll(`.dot-${config.id}`)
        .data(curveData.filter((_, i) => i % 6 === 0)) // 每6个点显示一个
        .enter()
        .append('circle')
        .attr('class', `dot dot-${config.id}`)
        .attr('cx', (d) => xScale(d.timestamp))
        .attr('cy', (d) => yScale(d.value))
        .attr('r', 3)
        .attr('fill', config.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);
    });

    // 添加光晕滤镜
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');

    filter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur');

    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // 添加鼠标交互层
    const focus = g.append('g').attr('class', 'focus').style('display', 'none');

    // 垂直线
    focus
      .append('line')
      .attr('class', 'vertical-line')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(255, 255, 255, 0.5)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');

    // 信息框
    const tooltip = focus
      .append('rect')
      .attr('class', 'tooltip-bg')
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('fill', 'rgba(0, 0, 0, 0.8)')
      .attr('stroke', 'rgba(255, 255, 255, 0.2)')
      .attr('stroke-width', 1);

    const tooltipText = focus.append('text').attr('class', 'tooltip-text').style('fill', '#fff').style('font-size', '12px').style('pointer-events', 'none');

    // 鼠标交互
    const overlay = g
      .append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => focus.style('display', 'none'))
      .on('mousemove', (event) => {
        const [mouseX] = d3.pointer(event);
        const timestamp = xScale.invert(mouseX);

        // 找到最近的时间点
        let closestPoint: TimeSeriesPoint | null = null;
        let minDistance = Infinity;
        curves.forEach((config) => {
          if (!config.visible) return;

          const curveData = data[config.id];
          curveData.forEach((point) => {
            const distance = Math.abs(point.timestamp.getTime() - timestamp.getTime());
            if (distance < minDistance) {
              minDistance = distance;
              closestPoint = point;
            }
          });
        });

        if (!closestPoint) return;

        // 更新垂直线
        focus
          .select('.vertical-line')
          .attr('x1', xScale((closestPoint as any).timestamp))
          .attr('x2', xScale((closestPoint as any).timestamp));

        // 更新工具提示
        const lines = [
          `时间: ${d3.timeFormat('%Y-%m-%d %H:%M')((closestPoint as any).timestamp)}`,
          ...curves
            .map((config) => {
              if (!config.visible) return '';
              const point = data[config.id].find((p) => Math.abs(p.timestamp.getTime() - closestPoint!.timestamp.getTime()) < 3600000);
              return point ? `${config.label}: ${Math.round(point.value)}ms` : '';
            })
            .filter(Boolean),
        ];

        tooltipText
          .selectAll('tspan')
          .data(lines)
          .join('tspan')
          .attr('x', 8)
          .attr('y', (_, i) => 20 + i * 18)
          .attr('dy', (i) => '1.2em')
          .text((d) => d);

        // 计算工具提示尺寸
        const bbox = tooltipText.node()?.getBBox();
        if (bbox) {
          tooltip
            .attr('x', bbox.x - 4)
            .attr('y', bbox.y - 4)
            .attr('width', bbox.width + 8)
            .attr('height', bbox.height + 8);
        }
      });

    // 添加标题
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .style('fill', 'rgba(255, 255, 255, 0.9)')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('响应时间监控');
  }, [data, dimensions, curves, onZoom]);

  return (
    <div className="time-series-chart" ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TimeSeriesChart;
