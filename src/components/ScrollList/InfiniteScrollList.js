import React, { useEffect, useState, useRef } from 'react';
import './index.css';
import { useInfiniteScroll } from './common';

function InfiniteScrollList(props) {
  const { renderItem, renderSkeleton, className } = props;
  const { loading, dataSource, fetchMore, hasMore, setFilter } = useInfiniteScroll();

  // 筛选器的输入
  const [searchTerm, setSearchTerm] = useState('');

  const containerRef = useRef(null);

  useEffect(() => {
    const scrollEvent = (event) => {
      if (!hasMore || loading) {
        return;
      }

      // 获取滚动容器的相关信息
      let scrollHeight = event.target?.scrollHeight;
      let scrollTop = event.target.scrollTop;
      let offsetHeight = event.target.offsetHeight;

      if (offsetHeight + scrollTop >= scrollHeight) {
        console.log('列表触底');
        fetchMore();
      }
    };

    containerRef.current?.addEventListener('scroll', scrollEvent);

    return () => {
      containerRef.current?.removeEventListener('scroll', scrollEvent);
    };
  }, [hasMore, loading, fetchMore]);

  // 点击查询按钮时，触发筛选
  const handleSearch = () => {
    setFilter({ searchTerm }); // 更新筛选条件
  };

  const classname = () => ['infinite-scroll-list', className].filter(Boolean).join(' ');

  return (
    <>
      <div className="title">滚动请求</div>
      <div className="query-search">
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="请输入搜索条件" />
        <button onClick={handleSearch}>查询</button>
      </div>
      <div className={classname()} ref={containerRef}>
        {dataSource.map((data, index) => (
          <div key={index} className="item">
            {renderItem(data)}
          </div>
        ))}
        {loading && <div className="skeleton">{renderSkeleton?.() || '加载中...'}</div>}
        {!hasMore && !loading && <div className="no-more">没有更多数据了</div>}
      </div>
    </>
  );
}

export default InfiniteScrollList;
