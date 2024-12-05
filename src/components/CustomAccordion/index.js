import React, { useState, useEffect, useRef } from 'react';
import up from '@/assets/imgs/up.png';
import './index.scss';

/**
 * 自定义手风琴组件
 */
export const Accordion = (props) => {
  let { title, children, className = '', deleteIcon } = props;

  const [isOpen, setIsOpen] = useState(false);
  const itemRef = useRef(null);

  useEffect(() => {
    let itemDom = itemRef.current;
    if (isOpen) {
      itemDom.style.height = 'auto';
      const { height } = itemDom.getBoundingClientRect();
      itemDom.style.height = 0;
      itemDom.getBoundingClientRect(); // 让页面强制回流，使得数据生成到整个布局的计算结果里
      itemDom.style.height = height + 'px';
      itemDom.style.marginTop = 10 + 'px';
      itemDom.style.marginBottom = 10 + 'px';
    } else {
      itemDom.style.height = 0;
      itemDom.style.marginTop = 0;
      itemDom.style.marginBottom = 0;
    }
  }, [isOpen]);

  // 激活类名
  let activeClass = (v) => (isOpen ? v : '');

  return (
    <div id="custom-accordion" className={className}>
      <div className={['header-wrap', activeClass('active-header')].join(' ')} onClick={() => setIsOpen(!isOpen)}>
        <div className="titleWrap">
          {title}
          {deleteIcon}
        </div>
        <div className={['iconWrap', !isOpen ? 'active' : ''].join(' ')}>
          <img src={up} />
        </div>
      </div>
      <div ref={itemRef} className={['item', activeClass('active-item')].join(' ')}>
        {children ? children : <div>暂无数据</div>}
      </div>
    </div>
  );
};

/**
 * 自定义手风琴使用
 */
export const CustomAccordion = () => {
  return (
    <div className="testCustomAccordion">
      <Accordion title={`标题1`}>
        <div className="listItem">
          <div className="listItem-label">LABEL1内容</div>
          <div className="listItem-content">你好</div>
        </div>
        <div className="listItem">
          <div className="listItem-label">LABEL2内容</div>
          <div className="listItem-content">你好</div>
        </div>
        <div className="listItem">
          <div className="listItem-label">LABEL3内容</div>
          <div className="listItem-content">你好</div>
        </div>
      </Accordion>
      <Accordion title={`标题2`}>
        <div className="listItem">
          <div className="listItem-label">LABEL内容</div>
          <div className="listItem-content">你好</div>
        </div>
      </Accordion>
    </div>
  );
};
