const mock = require('../../utils/mock')

const STATUS_TABS = [
  { key: 'all', label: '全部', count: 0 },
  { key: 'pending', label: '待处理', count: 0 },
  { key: 'accepted', label: '已接单', count: 0 },
  { key: 'purchasing', label: '采购中', count: 0 },
  { key: 'delivering', label: '配送中', count: 0 },
  { key: 'done', label: '已完成', count: 0 },
]

const NEXT_STATUS = {
  pending: { status: 'accepted', text: '已接单' },
  accepted: { status: 'purchasing', text: '采购中' },
  purchasing: { status: 'delivering', text: '配送中' },
  delivering: { status: 'done', text: '已完成' },
}

Page({
  data: { orders: [], filteredOrders: [], currentTab: 'all', currentTabLabel: '', tabs: [], stats: {} },

  normalizeOrder(order) {
    const items = (order.items || []).map(item => ({
      ...item,
      purchased: item.purchased === true
    }))
    const purchaseTotal = items.length
    const purchaseDone = items.filter(item => item.purchased).length
    return { ...order, items, purchaseTotal, purchaseDone }
  },

  onShow() {
    const adminOrders = wx.getStorageSync('admin_orders') || []
    const userOrders = wx.getStorageSync('orders') || []
    const map = {}
    ;[...mock.MOCK_ORDERS, ...userOrders, ...adminOrders].forEach(order => {
      map[order.id] = order
    })
    const orders = Object.values(map)
      .map(order => this.normalizeOrder(order))
      .sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || '')))
    wx.setStorageSync('admin_orders', orders)
    this.setData({ orders })
    this.refreshData()
  },

  refreshData() {
    const orders = this.data.orders
    const tabs = STATUS_TABS.map(t => ({
      ...t,
      count: t.key === 'all' ? 0 : orders.filter(o => o.status === t.key).length
    }))
    const cur = this.data.currentTab
    const filtered = cur === 'all' ? orders : orders.filter(o => o.status === cur)
    const curTab = tabs.find(t => t.key === cur)
    const today = new Date().toLocaleDateString('zh-CN')
    const todayOrders = orders.filter(o => o.createTime && o.createTime.startsWith && o.createTime.includes(today.slice(5)))
    this.setData({
      tabs,
      filteredOrders: filtered,
      currentTabLabel: curTab ? curTab.label : '全部',
      stats: {
        todayOrders: todayOrders.length || orders.length,
        todayRevenue: orders.reduce((s, o) => s + parseFloat(o.total || 0), 0).toFixed(0),
        pendingCount: orders.filter(o => o.status === 'pending').length,
        doneCount: orders.filter(o => o.status === 'done').length,
      }
    })
  },

  onTabTap(e) {
    this.setData({ currentTab: e.currentTarget.dataset.key })
    this.refreshData()
  },

  _updateStatus(id, status, text) {
    const orders = this.data.orders.map(o =>
      o.id === id ? { ...o, status, statusText: text } : o
    )
    wx.setStorageSync('admin_orders', orders)
    const userOrders = (wx.getStorageSync('orders') || []).map(o =>
      o.id === id ? { ...o, status, statusText: text } : o
    )
    wx.setStorageSync('orders', userOrders)
    this.setData({ orders })
    this.refreshData()
  },

  syncOrders(orders) {
    wx.setStorageSync('admin_orders', orders)
    const map = {}
    orders.forEach(order => { map[order.id] = order })
    const userOrders = (wx.getStorageSync('orders') || []).map(order =>
      map[order.id] ? map[order.id] : order
    )
    wx.setStorageSync('orders', userOrders)
    this.setData({ orders })
    this.refreshData()
  },

  togglePurchaseItem(e) {
    const { id, gidx } = e.currentTarget.dataset
    const index = Number(gidx)
    const orders = this.data.orders.map(order => {
      if (order.id !== id) return order
      if (order.status !== 'purchasing') return order
      const items = (order.items || []).map((item, idx) =>
        idx === index ? { ...item, purchased: !item.purchased } : item
      )
      return this.normalizeOrder({ ...order, items })
    })
    this.syncOrders(orders)
  },

  accept(e) { this._updateStatus(e.currentTarget.dataset.id, 'accepted', '已接单') },
  startPurchase(e) {
    const id = e.currentTarget.dataset.id
    const orders = this.data.orders.map(order => {
      if (order.id !== id) return order
      const items = (order.items || []).map(item => ({ ...item, purchased: item.purchased === true }))
      return this.normalizeOrder({ ...order, items, status: 'purchasing', statusText: '采购中' })
    })
    this.syncOrders(orders)
  },
  startDeliver(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.orders.find(o => o.id === id)
    if (order && order.purchaseDone < order.purchaseTotal) {
      wx.showToast({ title: '还有商品未勾选购买', icon: 'none' })
      return
    }
    this._updateStatus(id, 'delivering', '配送中')
  },
  finishOrder(e) { this._updateStatus(e.currentTarget.dataset.id, 'done', '已完成') },

  goPurchase() {
    wx.navigateTo({ url: '/pages/admin-purchase/admin-purchase' })
  },

  goProducts() {
    wx.navigateTo({ url: '/pages/admin-products/admin-products' })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/track/track?id=${e.currentTarget.dataset.id}` })
  }
})
