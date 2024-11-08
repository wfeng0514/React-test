import React from "react";
import { Cascader } from "./Cascader";

// 测试数据
const treeData = [
  {
    value: "fruits",
    label: "水果",
    children: [
      {
        value: "citrus",
        label: "柑橘类",
        children: [
          { value: "orange", label: "橙子" },
          { value: "lemon", label: "柠檬" },
        ],
      },
      {
        value: "berries",
        label: "浆果类",
        children: [
          { value: "strawberry", label: "草莓" },
          { value: "blueberry", label: "蓝莓" },
        ],
      },
    ],
  },
  {
    value: "vegetables",
    label: "蔬菜",
    children: [
      {
        value: "leafy",
        label: "叶菜类",
        children: [
          { value: "spinach", label: "菠菜" },
          { value: "lettuce", label: "生菜" },
        ],
      },
      {
        value: "root",
        label: "根茎类",
        children: [
          { value: "carrot", label: "胡萝卜" },
          { value: "potato", label: "土豆" },
        ],
      },
    ],
  },
];

export default function index() {
  return (
    <div>
      <Cascader data={treeData} />
    </div>
  );
}
