import React, { useEffect, useRef, useState } from 'react';
import './index.css';

/**
 * 滚动请求测试
 */
function InfiniteScrollList(props) {
  const { dataSource, renderItem, renderSkeleton, loading, hasMore, loadMore, className, threshold } = props;
  const containerRef = useRef(null);

  useEffect(() => {
    const scrollEvent = (event) => {
      if (!hasMore || loading) {
        return;
      }

      const { scrollHeight, scrollTop, offsetHeight } = event.target;

      // 判断是否到达底部
      if (scrollHeight - (scrollTop + offsetHeight) <= threshold) {
        loadMore();
      }
    };

    const currentContainer = containerRef.current;
    currentContainer?.addEventListener('scroll', scrollEvent);

    return () => {
      currentContainer?.removeEventListener('scroll', scrollEvent);
    };
  }, [hasMore, loading, threshold]);

  const containerClassName = ['infinite-scroll-list', className].filter(Boolean).join(' ');

  return (
    <div className={containerClassName} ref={containerRef}>
      {dataSource.map((data, index) => renderItem(data, index))}
      {loading && (renderSkeleton ? renderSkeleton() : <div>加载中...</div>)}
      {!hasMore && <div className="no-more">已加载全部数据</div>}
    </div>
  );
}

export default InfiniteScrollList;
