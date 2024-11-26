// src/Tabs.js
import React, { useState, useRef, useEffect } from 'react';
import './Tabs.css';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState(0); // 当前激活的 Tab
  const [previousTab, setPreviousTab] = useState(0); // 上一个激活的 Tab
  const tabs = ['热榜 1', '热榜 2', '热榜 3']; // Tab 名称
  const contents = ['这是热榜 1 的内容', '这是热榜 2 的内容', '这是热榜 3 的内容'];

  const tabContainerRef = useRef(null); // 用于获取 Tab 容器的 DOM
  const underlineRef = useRef(null); // 用于控制下划线的位置

  useEffect(() => {
    // 计算下划线的初始位置和宽度
    if (tabContainerRef.current && underlineRef.current) {
      const activeTabEl = tabContainerRef.current.children[activeTab];
      const tabRect = activeTabEl.getBoundingClientRect();
      underlineRef.current.style.width = `${tabRect.width}px`;
      underlineRef.current.style.left = `${tabRect.left - tabContainerRef.current.getBoundingClientRect().left}px`;
    }
  }, [activeTab]); // 当 activeTab 改变时，重新计算下划线位置

  const handleTabClick = (index) => {
    if (index !== activeTab) {
      setPreviousTab(activeTab);
      setActiveTab(index);
    }
  };

  return (
    <div className="tabs-wrapper">
      {/* Tab 列表 */}
      <div className="tabs-container" ref={tabContainerRef}>
        {tabs.map((tab, index) => (
          <div key={index} className={`tab ${activeTab === index ? 'active' : ''}`} onClick={() => handleTabClick(index)}>
            {tab}
          </div>
        ))}
        {/* 动态的下划线 */}
        <div className="underline" ref={underlineRef} />
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">
        <p>{contents[activeTab]}</p>
      </div>
    </div>
  );
};

export default Tabs;
