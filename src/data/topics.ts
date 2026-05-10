import type { Topic } from '@/types'

export const TOPICS: Topic[] = [
  { id: 'number-system', order: 1, name: '数的概念', description: '自然数 / 整数 / 0 / 奇偶 / 质合 / 因倍 / 互质' },
  { id: 'operations', order: 2, name: '四则运算', description: '加减乘除 + 运算律' },
  { id: 'fractions', order: 3, name: '分数', description: '意义 / 性质 / 通分 / 四则' },
  { id: 'decimals-percent', order: 4, name: '小数与百分数', description: '小数 + 百分数 + 三者互化' },
  { id: 'ratio-proportion', order: 5, name: '比与比例', description: '比 + 正反比例' },
  { id: 'geometry-plane', order: 6, name: '平面图形', description: '线 / 角 / 三角形 / 四边形 / 圆' },
  { id: 'geometry-solid', order: 7, name: '立体图形', description: '长方体 / 正方体 / 圆柱 / 圆锥' },
  { id: 'measurement', order: 8, name: '量与单位', description: '长 / 面 / 体 / 质量 / 时间' },
  { id: 'statistics', order: 9, name: '统计概念', description: '平均 / 中位 / 众数' },
  { id: 'equations', order: 10, name: '方程', description: '用字母表示数 + 解方程' },
  { id: 'word-problems', order: 11, name: '应用题模型', description: '行程 / 工程 / 浓度 / 百分数 / 利润' },
  { id: 'misc', order: 12, name: '综合', description: '数论 / 逻辑 / 找规律' },
]

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find(t => t.id === id)
}
