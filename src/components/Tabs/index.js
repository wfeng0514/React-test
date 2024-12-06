import React, { useState, useRef, useEffect } from 'react';
import { TABS } from './const';
import './Tabs.css';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState(0); // 当前激活的 Tab

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
      setActiveTab(index);
    }
  };

  return (
    <>
      <div className="tabs-container" ref={tabContainerRef}>
        {TABS.map((tab, index) => (
          <div key={index} className={`tab ${activeTab === index ? 'active' : ''}`} onClick={() => handleTabClick(index)}>
            {tab.name}
          </div>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="tab-content">{TABS[activeTab].content}</div>
    </>
  );
};

export default Tabs;
