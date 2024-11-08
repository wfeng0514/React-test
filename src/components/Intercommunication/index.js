import React, { useState } from 'react';

export default function Index() {
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5]);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCalculate = () => {
    setLoading(true);
    
    // 使用外部 Worker 文件
    const worker = new Worker('./worker.js');
    
    worker.postMessage(numbers);

    worker.onmessage = function(event) {
      setResult(event.data);
      setLoading(false);
      worker.terminate();
    };

    worker.onerror = function(error) {
      console.error('Worker 错误:', error);
      setLoading(false);
      worker.terminate();
    };
  };

  return (
    <div>
      <h1>React Web Worker 示例</h1>
      <button onClick={handleCalculate} disabled={loading}>
        {loading ? '计算中...' : '开始计算'}
      </button>
      <div>
        <h2>计算结果：</h2>
        <p>{result.join(', ')}</p>
      </div>
    </div>
  );
}
