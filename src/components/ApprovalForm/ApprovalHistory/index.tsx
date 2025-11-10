import React from 'react';
import { Card } from 'antd';
import styles from '../approvalForm.module.scss';

// 审批历史数据类型
export interface ApprovalHistoryItem {
  step: string;
  status: 'success' | 'processing' | 'reject' | 'success';
  statusText: string;
  time: string;
  comment?: string;
  user?: string;
}

// 审批历史组件 Props
interface ApprovalHistoryProps {
  data?: ApprovalHistoryItem[];
}

// 默认审批历史数据
const defaultApprovalHistoryData: ApprovalHistoryItem[] = [
  {
    step: '开始',
    status: 'success',
    statusText: '成功',
    time: '2025-03-01 15:13',
    comment: '提交流程',
  },
  {
    step: '直属领导审核',
    status: 'success',
    statusText: '同意',
    time: '2025-03-01 16:27',
    comment: '同意！',
    user: '同意',
  },
  {
    step: '部门领导审核',
    status: 'success',
    statusText: '同意',
    time: '2025-03-01 16:27',
    comment: '同意，请联系质量项目经理控制问题风险最小表',
    user: '同意',
  },
  {
    step: '专业审批',
    status: 'success',
    statusText: '同意',
    time: '2025-03-01 16:27',
    comment: '同意，请联系质量项目经理控制问题风险最小表',
    user: '同意',
  },
  {
    step: '专业审批',
    status: 'reject',
    statusText: '驳回',
    time: '2025-03-01 16:27',
    comment: '内容填写不准确，无法核实。基于YFS使用的OneBPM审批系统目前已经通过飞书审批完成了化审批能力，但当前部分流程的审批效率和处理存在异常，影响业务的实际发生。',
    user: '同意',
  },
  {
    step: '开始',
    status: 'success',
    statusText: '成功',
    time: '2025-03-01 15:13',
    comment: '提交流程',
  },
  {
    step: '直属领导审核',
    status: 'success',
    statusText: '同意',
    time: '2025-03-01 16:27',
    comment: '同意！',
    user: '同意',
  },
  {
    step: '部门领导审核',
    status: 'processing',
    statusText: '处理中',
    time: '2025-03-01 16:27',
  },
];

// 审批历史组件
const ApprovalHistory: React.FC<ApprovalHistoryProps> = ({ data = defaultApprovalHistoryData }) => {
  return (
    <Card title="审批历史" className={styles.card}>
      <div className={styles.approvalHistory}>
        {data.map((item, index) => (
          <div key={index} className={styles.historyItem}>
            <div className={styles.stepHeader}>
              <div className={styles.stepTitle}>{item.step}</div>
              <div className={`${styles.stepStatus} ${styles[item.status]}`}>{item.statusText}</div>
            </div>
            <div className={styles.stepComment}>
              <div className={styles.stepTime}>{item.time}</div>
              {item.user && <strong>{item.user}：</strong>}
              {item.comment}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ApprovalHistory;
