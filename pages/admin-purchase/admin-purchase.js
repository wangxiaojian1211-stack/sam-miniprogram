const mock = require('../../utils/mock')

// 货架区域映射
const ZONE_MAP = {
  '烘焙甜点': { icon: '🥐', zone: '烘焙区' },
  '熟食':     { icon: '🍗', zone: '熟食区' },
  '肉类海鲜': { icon: '🥩', zone: '生鲜区' },
  '零食坚果': { icon: '🥜', zone: '零食区' },
  '饮料':     { icon: '🧃', zone: '饮料区' },
  '日用品':   { icon: '🧴', zone: '日用区' },
}

Page({
  data: { zones: [], totalItems: 0, totalCount: 0, purchasedCount: 0, remainingCount: 0, checkedCount: 0, progress: 0 },

  onLoad() {
    this.buildList()
  },

  buildList() {
    // 汇总所有活跃订单的商品
    const adminOrders = wx.getStorageSync('admin_orders') || []
    const userOrders = wx.getStorageSync('orders') || []
    const map = {}
    ;[...mock.MOCK_ORDERS, ...userOrders, ...adminOrders].forEach(order => {
      map[order.id] = order
    })
    const allOrders = Object.values(map)
    const activeOrders = allOrders.filter(o => ['pending','accepted','purchasing'].includes(o.status))

    // 合并相同商品
    const merged = {}
    activeOrders.forEach(order => {
      order.items.forEach(item => {
        const product = mock.getProductByName(item.name)
        const category = product ? product.category : '其他'
        const key = item.name
        if (!merged[key]) {
          merged[key] = {
            name: item.name,
            category,
            unit: product ? product.unit : '件',
            totalCount: 0,
            purchasedCount: 0,
            remainingCount: 0,
            orderCount: 0,
            checked: false
          }
        }
        merged[key].totalCount += item.count
        if (item.purchased === true) merged[key].purchasedCount += item.count
        merged[key].orderCount++
      })
    })
    Object.values(merged).forEach(item => {
      item.remainingCount = Math.max(item.totalCount - item.purchasedCount, 0)
      item.checked = item.totalCount > 0 && item.remainingCount === 0
    })

    // 按货架区域分组
    const zoneMap = {}
    Object.values(merged).forEach(item => {
      const zm = ZONE_MAP[item.category] || { icon: '📦', zone: '其他区' }
      const key = zm.zone
      if (!zoneMap[key]) zoneMap[key] = { name: key, icon: zm.icon, items: [] }
      zoneMap[key].items.push(item)
    })

    const zones = Object.values(zoneMap)
    const allItems = zones.flatMap(z => z.items)
    const totalItems = allItems.length
    const totalCount = allItems.reduce((s, i) => s + i.totalCount, 0)
    const purchasedCount = allItems.reduce((s, i) => s + i.purchasedCount, 0)
    const remainingCount = Math.max(totalCount - purchasedCount, 0)
    const checkedCount = allItems.filter(i => i.checked).length
    const progress = totalCount > 0 ? Math.round(purchasedCount / totalCount * 100) : 0

    this.setData({ zones, totalItems, totalCount, purchasedCount, remainingCount, checkedCount, progress })
  },

  toggleCheck(e) {
    const { zone: zoneIdx, gidx } = e.currentTarget.dataset
    const zIndex = Number(zoneIdx)
    const gIndex = Number(gidx)
    const zones = this.data.zones.map(zone => ({
      ...zone,
      items: zone.items.map(item => ({ ...item }))
    }))
    if (!zones[zIndex] || !zones[zIndex].items[gIndex]) return
    const target = zones[zIndex].items[gIndex]
    const nextPurchased = !target.checked
    this.syncPurchaseState(target.name, nextPurchased)
    this.buildList()
  },

  syncPurchaseState(productName, purchased) {
    const updateOrders = (orders) => orders.map(order => {
      if (!['pending','accepted','purchasing'].includes(order.status)) return order
      const items = (order.items || []).map(item =>
        item.name === productName ? { ...item, purchased } : item
      )
      return { ...order, items }
    })
    const adminOrders = updateOrders(wx.getStorageSync('admin_orders') || [])
    const userOrders = updateOrders(wx.getStorageSync('orders') || [])
    wx.setStorageSync('admin_orders', adminOrders)
    wx.setStorageSync('orders', userOrders)
  },

  exportList() {
    // 生成文本清单
    const settings = mock.getStoreSettings()
    let text = `${settings.storeName}采购清单 ${new Date().toLocaleDateString()}\n\n`
    this.data.zones.forEach(z => {
      text += `【${z.name}】\n`
      z.items.forEach(g => {
        text += `  ${g.checked ? '✓' : '○'} ${g.name} 总${g.totalCount}${g.unit} / 已采购${g.purchasedCount}${g.unit} / 未采购${g.remainingCount}${g.unit}\n`
      })
      text += '\n'
    })
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
    })
  }
})
