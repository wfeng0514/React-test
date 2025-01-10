import { CustomAccordion } from '@/components/CustomAccordion';
import ImageViewer from '@/components/ImageViewer';
import ProgressCircle from '@/components/ProgressCircle';
import RectangularProgressBar from '@/components/RectangularProgressBar';
import { ScrollList } from '@/components/ScrollList';
import { ScrollList1 } from '@/components/ScrollList1';
import WorkerTest from '@/components/WorkerTest';
import HoverScrollComponent from '@/components/HoverScrollComponent';

export const TABS = [
  { name: '自定义手风琴', content: <CustomAccordion /> },
  { name: '滚动请求', content: <ScrollList /> },
  { name: '滚动请求1', content: <ScrollList1 /> },
  { name: '图片预览', content: <ImageViewer /> },
  { name: '进度条', content: <ProgressCircle /> },
  { name: '矩形进度条', content: <RectangularProgressBar /> },
  { name: 'Worker', content: <WorkerTest /> },
  { name: '粘贴滚动效果', content: <HoverScrollComponent /> },
];
