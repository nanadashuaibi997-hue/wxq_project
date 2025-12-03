const flows = {
  home: [
    { title: '切换布局', content: '在这里切换宫格与轮播两种首页布局', selector: '[data-guide="home-layout"]' },
    { title: '分类入口', content: '点击分类查看对应的重点活动', selector: '[data-guide="home-categories"]' },
    { title: '轮播控制', content: '通过左右按钮切换上一张/下一张', selector: '[data-guide="home-carousel-next"]', guard: () => document.querySelector('[data-guide="home-carousel-next"]') !== null },
  ],
  activities: [
    { title: '状态筛选', content: '按活动状态进行过滤', selector: '[data-guide="list-status"]' },
    { title: '分类筛选', content: '选择活动分类', selector: '[data-guide="list-category"]' },
    { title: '关键词搜索', content: '按标题关键词搜索', selector: '[data-guide="list-keyword"]' },
    { title: '仅重点活动', content: '只看重点活动，便于聚焦运营核心', selector: '[data-guide="list-highlights"]' },
    { title: '活动列表', content: '这里展示筛选后的活动列表，支持虚拟滚动与分页', selector: '[data-guide="list-container"]' },
  ],
  'activity-detail': [
    { title: '进入编辑', content: '点击切换到编辑模式修改活动信息', selector: '[data-guide="detail-edit"]', guard: () => window.__hasEditPermission !== false },
    { title: '活动规则', content: '在此编写或查看活动规则文案', selector: '[data-guide="detail-rules"]' },
    { title: '提交更新', content: '编辑完成后提交更新并获得反馈', selector: '[data-guide="detail-submit"]', onEnter: () => {
      const submitBtn = document.querySelector('[data-guide="detail-submit"]')
      if (submitBtn) return
      const editBtn = document.querySelector('[data-guide="detail-edit"]')
      if (editBtn) editBtn.click()
    }, onLeave: () => {
      const submitBtn = document.querySelector('[data-guide="detail-submit"]')
      const editBtn = document.querySelector('[data-guide="detail-edit"]')
      if (submitBtn && editBtn) editBtn.click()
    } },
  ],
}

export default flows
