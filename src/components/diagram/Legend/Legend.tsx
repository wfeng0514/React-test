import React from 'react';
import { CurveConfig } from '../types/chart.types';
import './Legend.scss';

interface LegendProps {
  curves: CurveConfig[];
  onToggle: (id: string) => void;
}

const Legend: React.FC<LegendProps> = ({ curves, onToggle }) => {
  return (
    <div className="legend-panel">
      <h3 className="legend-title">图例</h3>
      <div className="legend-items">
        {curves.map((curve) => (
          <div key={curve.id} className={`legend-item ${curve.visible ? 'active' : 'inactive'}`} onClick={() => onToggle(curve.id)}>
            <div className="legend-color" style={{ backgroundColor: curve.color }}>
              <div
                className="legend-line"
                style={{
                  borderTop: `3px solid ${curve.color}`,
                  borderStyle: curve.strokeDasharray ? 'dashed' : 'solid',
                }}
              />
            </div>
            <div className="legend-content">
              <span className="legend-label">{curve.label}</span>
              <div className="legend-stats">
                <span className="legend-stat">实线</span>
                <span className="legend-stat">可点击切换</span>
              </div>
            </div>
            <div className="legend-toggle">
              <div className={`toggle-switch ${curve.visible ? 'on' : 'off'}`}>
                <div className="toggle-handle" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="legend-info">
        <p>点击图例可显示/隐藏对应的曲线</p>
        <p>
          当前显示 {curves.filter((c) => c.visible).length} / {curves.length} 条曲线
        </p>
      </div>
    </div>
  );
};

export default Legend;
