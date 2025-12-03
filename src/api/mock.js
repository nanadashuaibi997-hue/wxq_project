// 模拟接口
const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms))

const activities = Array.from({ length: 200 }).map((_, i) => {
  const start = new Date(Date.now() - Math.random() * 10 * 24 * 3600 * 1000)
  const end = new Date(start.getTime() + Math.random() * 10 * 24 * 3600 * 1000)
  const status = Date.now() < start.getTime() ? '未开始' : Date.now() > end.getTime() ? '已结束' : '进行中'
  return {
    id: i + 1,
    title: `活动 ${i + 1}`,
    category: ['节日','促销','品牌'][i % 3],
    banner: `/api/banner/${i % 5}.svg`,
    creator: ['Alice','Bob','Carol'][i % 3],
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    status,
    rules: `这是活动 ${i + 1} 的规则与说明。`,
    participants: Math.floor(Math.random() * 10000),
    highlights: i % 7 === 0,
  }
})

export async function fetchHomeHighlights() {
  await delay(300)
  return {
    bannerList: activities.filter(a => a.highlights && a.status === '进行中'),
    categories: ['全部','节日','促销','品牌'],
    announcements: [
      { id: 1, text: '双12活动火热进行中，欢迎参与！' },
      { id: 2, text: '系统维护公告：本周五凌晨短暂升级。' },
    ],
  }
}

export async function fetchActivityList({ page = 1, pageSize = 20, status, keyword, start, end, highlightsOnly = false, category } = {}) {
  await delay(500)
  let data = activities
  if (highlightsOnly) data = data.filter(a => a.highlights)
  if (category && category !== '全部') data = data.filter(a => a.category === category)
  if (status && status !== '全部') data = data.filter(a => a.status === status)
  if (keyword) data = data.filter(a => a.title.toLowerCase().includes(keyword.toLowerCase()))
  if (start) data = data.filter(a => new Date(a.startTime) >= new Date(start))
  if (end) data = data.filter(a => new Date(a.endTime) <= new Date(end))
  const total = data.length
  const list = data.slice((page - 1) * pageSize, page * pageSize)
  return { list, total, page, pageSize }
}

export async function fetchActivityDetail(id) {
  await delay(300)
  const item = activities.find(a => a.id === Number(id))
  if (!item) throw new Error('活动不存在')
  return item
}

export async function updateActivity(id, payload) {
  await delay(300)
  const idx = activities.findIndex(a => a.id === Number(id))
  if (idx === -1) throw new Error('活动不存在')
  activities[idx] = { ...activities[idx], ...payload }
  return { success: true, data: activities[idx] }
}
