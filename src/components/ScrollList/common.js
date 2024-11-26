import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// 创建 InfiniteScroll 上下文

const defaultValue = {
  loading: false,
  dataSource: [],
  fetchMore: () => {},
  hasMore: true,
  query: {},
};

const InfiniteScrollContext = createContext(defaultValue);

export const useInfiniteScroll = () => useContext(InfiniteScrollContext);

export const Provider = (props) => {
  let { children, loadMore, initialData = [], initialQuery = {} } = props;

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState(initialData);
  const [query, setQuery] = useState(initialQuery);
  const [hasMore, setHasMore] = useState(true);

  // 使用 useEffect 监听 query 的变化，确保在 query 更新后自动加载新数据
  useEffect(() => {
    if (query && query.searchTerm !== undefined) {
      fetchMore(); // 每次 query 更新时自动加载数据
    }
  }, [query]); // 监听 query 变化

  // 更新筛选条件
  const setFilter = (newQuery) => {
    console.log('setFilter newQuery ===>', newQuery);
    setDataSource([]); // 每次筛选时清空当前数据
    setQuery(newQuery);
  };

  const fetchMore = useCallback(async () => {
    console.log('fetchMore 执行');
    if (loading || !hasMore) {
      return;
    }
    setLoading(true);

    try {
      const newData = await loadMore(query); // 加载数据时传入筛选条件
      let list = [...dataSource, ...newData];
      setDataSource(list);
      setHasMore(list.length < 50); // 判断是否还有更多
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, loadMore, query]);

  const value = {
    loading,
    dataSource,
    fetchMore,
    hasMore,
    query,
    setFilter,
  };

  return <InfiniteScrollContext.Provider value={value}>{children}</InfiniteScrollContext.Provider>;
};
