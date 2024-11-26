import React, { useState } from 'react';
import InfiniteScrollList from './InfiniteScrollList';
import { Provider } from './common';

export const Example = () => {
  const [hasMore, setHasMore] = useState(true);

  // 模拟异步加载数据
  const onLoadMore = async (query) =>
    new Promise((resolve) => {
      setTimeout(() => {
        console.log('加载数据，当前查询条件：', query);
        const newData = new Array(4).fill(0).map(() => `数据 ${Math.random()} - 搜索条件: ${query.searchTerm || ''}`);
        // 假设加载完 20 条数据后就没有更多了
        setHasMore(newData.length === 4);
        resolve(newData);
      }, 1000);
    });

  return (
    <Provider loadMore={onLoadMore} hasMore={hasMore} initialData={new Array(20).fill(0).map(() => `数据 ${Math.random()}`)}>
      <InfiniteScrollList renderItem={(data) => <div>{data}</div>} />
    </Provider>
  );
};
