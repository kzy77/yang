// game/levels.ts

// 定义层级配置的接口，与 logic.ts 中的 layersConfig 一致
export interface LayerConfig {
  layer: number; // 层级编号，从0开始或1开始，根据设计决定
  count: number; // 该层级的卡片数量
  // 可以添加更多与布局相关的属性，例如：
  // rows?: number;
  // columns?: number;
  // layoutPattern?: string; // 描述卡片在此层级的排列方式
}

// 定义单个关卡的接口
export interface Level {
  id: number; // 关卡ID
  name: string; // 关卡名称
  cardTypes: string[]; // 该关卡使用的卡片类型
  cardsPerType: number; // 每种类型卡片的数量（通常是3的倍数，以确保可以完全消除）
  layers: LayerConfig[]; // 关卡的层级布局配置
  // 可以添加其他关卡特定属性，如时间限制、目标分数等
}

// 示例关卡数据
export const sampleLevels: Level[] = [
  {
    id: 1,
    name: "第一关：入门",
    cardTypes: ['sheep', 'grass', 'wolf', 'house', 'tree', 'flower'], // 示例卡片类型
    cardsPerType: 6, // 每种类型6张，共36张卡片，12组可消除
    layers: [
      { layer: 0, count: 12 }, // 最底层
      { layer: 1, count: 12 },
      { layer: 2, count: 12 }, // 最顶层
      // 总卡片数必须与 cardTypes.length * cardsPerType 匹配或由 initializeGame 处理差异
    ],
  },
  {
    id: 2,
    name: "第二关：挑战",
    cardTypes: ['sheep', 'grass', 'wolf', 'house', 'tree', 'flower', 'sun', 'moon'],
    cardsPerType: 9, // 每种类型9张
    layers: [
      { layer: 0, count: 24 },
      { layer: 1, count: 24 },
      { layer: 2, count: 24 },
    ],
  },
  // 可以添加更多关卡...
];

// 获取特定关卡的函数
export function getLevelById(levelId: number): Level | undefined {
  return sampleLevels.find(level => level.id === levelId);
}

console.log('Game levels module loaded');