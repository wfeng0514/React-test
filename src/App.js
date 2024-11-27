import { useEffect, useState } from 'react';
// import WorkerTest from './components/WorkerTest';
// import ProgressCircle from './components/ProgressCircle';
// import RectangularProgressBar from './components/RectangularProgressBar';
// import Tabs from './components/Tabs';
// import ImageViewer from './components/ImageViewer';
import { Example } from './components/ScrollList';

function App() {
  const [update, setUpdate] = useState(false);

  console.log('我是上面的');

  useEffect(() => {
    console.log('useEffect 中间代码块');

    return () => {
      console.log('useEffect return 代码块');
    };
  }, [update]);

  console.log('我是下面的');
  return (
    <div className="App">
      {/* 我是App
      <button onClick={() => setUpdate(!update)}>更新</button>
      {update ? '更新啦' : ''} */}
      {/* <WorkerTest /> */}
      {/* <ProgressCircle />
      <RectangularProgressBar /> */}
      {/* <Tabs /> */}
      {/* <ImageViewer /> */}
      <Example />
    </div>
  );
}

export default App;
