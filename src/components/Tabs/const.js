import { CustomAccordion } from '@/components/CustomAccordion';
import ImageViewer from '@/components/ImageViewer';
import ProgressCircle from '@/components/ProgressCircle';
import RectangularProgressBar from '@/components/RectangularProgressBar';
import { ScrollList } from '@/components/ScrollList';
import { ScrollList1 } from '@/components/ScrollList1';
import WorkerTest from '@/components/WorkerTest';
import HoverScrollComponent from '@/components/HoverScrollComponent';
import File from '@/components/File';
// import ApprovalForm from '@/components/ApprovalForm';
import ApprovalForm from '@/components/ApprovalForm-tailwind';
import Diagram from '@/components/diagram';
import schema from '@/assets/json/schema.json';

export const TABS = [
  { name: '超级审批', content: <ApprovalForm schemaData={schema} /> },
  { name: '图表', content: <Diagram /> },
  { name: '自定义手风琴', content: <CustomAccordion /> },
  { name: '滚动请求', content: <ScrollList /> },
  { name: '滚动请求1', content: <ScrollList1 /> },
  { name: '图片预览', content: <ImageViewer /> },
  {
    name: '进度条',
    content: (
      <div>
        <div>
          <h3>圆形进度条</h3>
          <ProgressCircle />
        </div>
        <div>
          <h3>矩形进度条</h3>
          <RectangularProgressBar />
        </div>
      </div>
    ),
  },
  { name: 'Worker', content: <WorkerTest /> },
  { name: '粘贴滚动效果', content: <HoverScrollComponent /> },
  { name: 'File', content: <File /> },
];
