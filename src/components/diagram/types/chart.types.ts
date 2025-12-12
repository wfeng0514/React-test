export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface TimeSeriesData {
  avgDuration: TimeSeriesPoint[];
  timeoutThreshold: TimeSeriesPoint[];
  targetDuration: TimeSeriesPoint[];
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CurveConfig {
  id: keyof TimeSeriesData;
  label: string;
  color: string;
  strokeWidth: number;
  strokeDasharray?: string;
  visible: boolean;
}

export interface BrushSelection {
  start: number; // 0-1的比例值
  end: number; // 0-1的比例值
}
