import React from 'react';
import { Card } from 'antd';
import styles from './styles.module.scss';

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
    <Card className={styles.card}>
      <div className={styles.cardTitle}>
        <div>
          <img src={'/img/icon_chat.png'} />
          &nbsp;
          <span className={styles.count}>{`审批沟通(${data.length})`}</span>
        </div>
        <span className={styles.viewChat}>
          <img src={'/img/person.png'} />
          <span>进入群聊</span>
        </span>
      </div>

      {/* 审批沟通 */}
      <div className={styles.approvalChat}>
        <div className={styles.item}>
          <img className={styles.avator} src={'/img/icon_avator.png'} />
          <div className={styles.contentWrap}>
            <div className={styles.header}>
              <div>{'Zhang.Qin(YFA,SHANGHAI.CN)'}</div>
              <div className={styles.time}>一小时以前</div>
            </div>
            <div className={styles.content}>
              <div>联系质量项目经理控制范围。 </div>
              <div>
                <img src="/img/icon_res.png" />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.item}>
          <img className={styles.avator} src={'/img/icon_avator.png'} />
          <div className={styles.contentWrap}>
            <div className={styles.header}>
              <div>{'Zhang.Qin(YFA,SHANGHAI.CN)'}</div>
              <div className={styles.time}>一小时以前</div>
            </div>
            <div className={styles.content}>
              <div>请联系质量项目经理控制问题风险最小范围。 </div>
              <div>
                <img src="/img/icon_res.png" />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.item}>
          <img className={styles.avator} src={'/img/icon_avator.png'} />
          <div className={styles.contentWrap}>
            <div className={styles.header}>
              <div>{'Dongming(YIZIT,VENDOR)'}</div>
              <div className={styles.time}>一小时以前</div>
            </div>
            <div className={styles.content}>
              <div>工作计划文档请持续了解和跟进@Zeyu Wen (EXT,Eastshine,VENDOR) </div>
              <div>
                <img src="/img/icon_res.png" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ApprovalHistory;
