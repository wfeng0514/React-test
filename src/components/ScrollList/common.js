import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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

/**
 * 用于在滚动事件中检查每个元素是否进入可视区，并调用相应的回调函数
 * @param {HTMLElement} scrollElement 滚动元素
 * @returns
 */
export const useLazyShow = (scrollElement = window) => {
  const showMap = useRef({}).current; // 存储每个元素的回调
  const refMap = useRef({}).current; // 存储每个元素的 DOM 引用

  const [el, setScrollEl] = useState(scrollElement);
  console.log(refMap, 'refMap');
  console.log(showMap, 'showMap');

  // 使用 useCallback 来避免 throttle 函数重复创建
  const throttle = useCallback((func, delay) => {
    let timer = null;
    return (...args) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }, []);

  // 改为 useCallback 以避免不必要的重新创建
  const onScroll = useCallback(
    throttle(() => {
      const windowHeight = window.innerHeight;
      // 遍历 refMap 中的所有元素，判断是否进入视口
      for (const name in refMap) {
        if (!refMap[name]) continue;

        const top = refMap[name].getBoundingClientRect().top;
        if (top <= windowHeight && showMap[name]) {
          const call = showMap[name];
          showMap[name] = null; // 防止重复触发
          try {
            call(); // 执行对应的回调函数
          } catch (e) {
            console.error(e);
          }
        }
      }
    }, 200),
    [refMap, showMap], // 依赖 refMap 和 showMap
  );

  // 用 useEffect 来添加和清理事件监听
  useEffect(() => {
    if (el) {
      el.addEventListener('scroll', onScroll);
    }
    return () => el && el.removeEventListener('scroll', onScroll);
  }, [el, onScroll]); // onScroll 作为依赖项

  // 提供 API 接口
  const onShow = (name, func) => {
    showMap[name] = func; // 注册回调
  };

  const onRef = (name) => {
    return (node) => {
      if (node) {
        refMap[name] = node; // 将 ref 存入 map
      }
    };
  };

  return {
    onShow,
    onRef,
    setScrollEl,
  };
};
