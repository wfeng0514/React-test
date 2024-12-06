import React, { useState, useEffect, useRef } from 'react';
import InfiniteScrollList from './InfiniteScrollList';
import { Provider, useLazyShow } from './common';

export const ScrollList = () => {
  const [hasMore, setHasMore] = useState(true);
  const { onShow, onRef } = useLazyShow();

  // 使用 useRef 来创建一个包含 10 个元素引用的数组
  const refs = Array.from({ length: 10 }, () => useRef());

  // 注册回调，当元素1进入视口时调用
  useEffect(() => {
    for (let i = 0; i < refs.length; i++) {
      onShow(`testItem${i}`, () => {
        console.log(`testItem ${i + 1} has entered the viewport!`);
      });
    }
  }, [onShow]);

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
    <div>
      <Provider loadMore={onLoadMore} hasMore={hasMore} initialData={new Array(20).fill(0).map(() => `数据 ${Math.random()}`)}>
        {/* <InfiniteScrollList renderItem={(data) => <div>{data}</div>} /> */}
        {refs.map((_, i) => {
          return (
            <div key={i} ref={onRef(`testItem${i}`)} className="testItem">
              testItem{i + 1}
            </div>
          );
        })}
      </Provider>
    </div>
  );
};
