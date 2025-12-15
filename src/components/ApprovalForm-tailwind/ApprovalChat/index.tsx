import React from 'react';
import { Card } from 'antd';

// 类型定义
export interface ApprovalItem {
  step: string;
  status: 'success' | 'processing' | 'reject' | 'success';
  statusText: string;
  time: string;
  comment?: string;
  user?: string;
}

interface ApprovalProps {
  data?: ApprovalItem[];
}

// 聊天消息类型
interface ChatMessage {
  userName: string;
  time: string;
  message: string;
  hasAttachment?: boolean;
}

// 默认数据
const defaultApprovalData: ApprovalItem[] = [
  // ... 保持不变
];

// 聊天消息数据
const chatMessages: ChatMessage[] = [
  {
    userName: 'Zhang.Qin(YFA,SHANGHAI.CN)',
    time: '一小时以前',
    message: '联系质量项目经理控制范围。',
    hasAttachment: true,
  },
  {
    userName: 'Li.Ming(YFB,BEIJING.CN)',
    time: '两小时前',
    message: '已确认相关文档，请继续处理。',
  },
  {
    userName: 'Wang.Fang(YFC,SHENZHEN.CN)',
    time: '三小时前',
    message: '需要补充风险控制说明。',
  },
  {
    userName: 'Zhao.Wei(YFD,GUANGZHOU.CN)',
    time: '四小时前',
    message: '审批流程已启动。',
  },
  {
    userName: 'Sun.Li(YFE,CHENGDU.CN)',
    time: '五小时前',
    message: '等待相关部门反馈。',
  },
];

// 常量配置
const CONSTANTS = {
  IMAGES: {
    CHAT_ICON: '/img/icon_chat.png',
    PERSON_ICON: '/img/person.png',
    AVATAR: '/img/icon_avator.png',
    ATTACHMENT: '/img/icon_res.png',
  },
  STYLES: {
    CARD: 'h-full mb-[10px] border-0',
    HEADER: 'flex justify-between items-center',
    TITLE: 'flex items-center text-[14px] font-bold gap-2',
    CHAT_ICON: 'w-[18px]',
    ENTER_CHAT: 'flex items-center text-[14px] cursor-pointer gap-2',
    MESSAGE_ITEM: 'flex border-b border-[#F5F5F5] py-[20px] last:border-0',
    AVATAR: 'w-[36px] h-[36px] rounded-full flex-shrink-0',
    MESSAGE_CONTENT: 'flex-1 ml-[20px] min-w-0',
    USER_INFO: 'flex justify-between items-start gap-2 mb-1',
    USER_NAME_CONTAINER: 'flex-1 min-w-0 overflow-hidden',
    USER_NAME: 'whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]',
    TIME_CONTAINER: 'flex-shrink-0 ml-2',
    TIME: 'text-[12px] text-gray-700 whitespace-nowrap',
    MESSAGE_TEXT: 'text-[12px] text-gray-700',
  },
} as const;

/**
 * 组件拆分：聊天消息项
 * @returns
 */
const ChatMessageItem: React.FC<{ message: ChatMessage; index: number }> = ({ message, index }) => (
  <div className={CONSTANTS.STYLES.MESSAGE_ITEM} key={index}>
    <img className={CONSTANTS.STYLES.AVATAR} src={CONSTANTS.IMAGES.AVATAR} alt="用户头像" />
    <div className={CONSTANTS.STYLES.MESSAGE_CONTENT}>
      <div className={CONSTANTS.STYLES.USER_INFO}>
        <div className={CONSTANTS.STYLES.USER_NAME_CONTAINER}>
          <div className={CONSTANTS.STYLES.USER_NAME} title={message.userName}>
            {message.userName}
          </div>
        </div>
        <div className={CONSTANTS.STYLES.TIME_CONTAINER}>
          <div className={CONSTANTS.STYLES.TIME}>{message.time}</div>
        </div>
      </div>
      <div className={CONSTANTS.STYLES.MESSAGE_TEXT}>
        <div>{message.message}</div>
        {message.hasAttachment && (
          <div className="mt-1">
            <img src={CONSTANTS.IMAGES.ATTACHMENT} alt="附件" className="max-w-full" />
          </div>
        )}
      </div>
    </div>
  </div>
);

/**
 * 组件拆分：卡片头部
 * @returns
 */
const CardHeader: React.FC<{ dataCount: number }> = ({ dataCount }) => (
  <div className={CONSTANTS.STYLES.HEADER}>
    <div className={CONSTANTS.STYLES.TITLE}>
      <img className={CONSTANTS.STYLES.CHAT_ICON} src={CONSTANTS.IMAGES.CHAT_ICON} alt="聊天图标" />
      <span>{`审批沟通(${dataCount})`}</span>
    </div>
    <span className={CONSTANTS.STYLES.ENTER_CHAT}>
      <img src={CONSTANTS.IMAGES.PERSON_ICON} alt="群聊图标" />
      <span>进入群聊</span>
    </span>
  </div>
);

/**
 * 主组件
 * @returns
 */
const ApprovalChat: React.FC<ApprovalProps> = ({ data = defaultApprovalData }) => {
  return (
    <Card className={CONSTANTS.STYLES.CARD}>
      {/* 头部 */}
      <CardHeader dataCount={data.length} />

      {/* 聊天消息列表 */}
      <div>
        {chatMessages.map((message, index) => (
          <ChatMessageItem key={index} message={message} index={index} />
        ))}
      </div>
    </Card>
  );
};

export default ApprovalChat;
