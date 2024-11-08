import React, { useState } from "react";

// 树形数据示例

export const Cascader = ({ data }) => {
  const [selected, setSelected] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [open, setOpen] = useState(false);

  const handleSelect = (item) => {
    const newSelected = [...selected.slice(0, currentLevel), item];
    setSelected(newSelected);
    if (item.children) {
      setCurrentLevel(currentLevel + 1);
    } else {
      setOpen(false);
    }
  };

  const handleReset = () => {
    setSelected([]);
    setCurrentLevel(0);
    setOpen(false);
  };

  const renderOptions = (options) => {
    return options.map((option) => (
      <div
        key={option.value}
        onClick={() => handleSelect(option)}
        style={{ padding: "8px", cursor: "pointer" }}
      >
        {option.label}
      </div>
    ));
  };

  const currentOptions = selected.length
    ? selected[selected.length - 1].children || []
    : data;

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        style={{
          border: "1px solid #ccc",
          padding: "8px",
          cursor: "pointer",
        }}
      >
        {selected.map((s) => s.label).join(" / ") || "请选择"}
      </div>
      {open && (
        <div
          style={{
            border: "1px solid #ccc",
            position: "absolute",
            backgroundColor: "#fff",
            zIndex: 1,
          }}
        >
          {currentLevel > 0 && (
            <div
              onClick={handleReset}
              style={{ padding: "8px", cursor: "pointer", color: "red" }}
            >
              返回上级
            </div>
          )}
          {renderOptions(currentOptions)}
        </div>
      )}
    </div>
  );
};
