import React, { useState } from 'react';
import InfiniteScrollList from './InfiniteScrollList';

export const ScrollList1 = () => {
  const [dataSource, setDataSource] = useState(new Array(40).fill('初始化数据'));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreData = async () => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);
    // 模拟网络请求
    const newData = await new Promise((resolve) => setTimeout(() => resolve(new Array(5).fill(`New data ${Math.random()}`)), 1000));

    setDataSource((prevData) => [...prevData, ...newData]);
    if (newData.length > 95) {
      setHasMore(false); // 没有更多数据
    }
    setLoading(false);
  };

  const renderItem = (data, index) => (
    <div key={index} className="item">
      {data}
    </div>
  );

  const renderSkeleton = () => <div className="skeleton">加载中...</div>;

  return (
    <div>
      <h1>Infinite Scroll Example</h1>
      <InfiniteScrollList
        loading={loading}
        dataSource={dataSource}
        renderItem={renderItem}
        renderSkeleton={renderSkeleton}
        loadMore={loadMoreData}
        hasMore={hasMore}
        threshold={50} // Adjust when the loadMore should be triggered
      />
    </div>
  );
};
