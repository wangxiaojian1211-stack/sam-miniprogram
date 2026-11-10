const mock = require('../../utils/mock')

const STATUS_MAP = {
  pending:    { icon: '⏳', text: '待处理', step: 0 },
  accepted:   { icon: '✅', text: '已接单', step: 1 },
  purchasing: { icon: '🛒', text: '采购中', step: 2 },
  delivering: { icon: '🚗', text: '配送中', step: 3 },
  done:       { icon: '🎉', text: '已完成', step: 4 },
}

Page({
  data: { order: {}, steps: [], timelines: [], statusIcon: '', statusText: '' },

  onLoad(options) {
    // 优先读取商家端订单状态，保证用户端跟踪与商家处理进度一致
    const adminOrders = wx.getStorageSync('admin_orders') || []
    const localOrders = wx.getStorageSync('orders') || []
    let order = adminOrders.find(o => o.id === options.id)
    if (!order) order = localOrders.find(o => o.id === options.id)
    if (!order) order = mock.MOCK_ORDERS.find(o => o.id === options.id) || mock.MOCK_ORDERS[0]

    const sm = STATUS_MAP[order.status] || STATUS_MAP.pending
    const STEP_LABELS = ['下单成功', '商家接单', '采购中', '配送中', '已完成']
    const steps = STEP_LABELS.map((label, idx) => ({
      label,
      done: idx < sm.step,
      active: idx === sm.step
    }))

    const now = new Date()
    const fmt = (d) => `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    const timelines = [
      { time: fmt(now), desc: `订单状态：${sm.text}` },
      { time: fmt(new Date(now - 1800000)), desc: '商家已确认接单，正在安排采购' },
      { time: order.createTime, desc: '订单已提交，等待商家确认' }
    ].slice(0, sm.step + 1)

    this.setData({ order, steps, timelines, statusIcon: sm.icon, statusText: sm.text })
    wx.setNavigationBarTitle({ title: `订单跟踪 · ${sm.text}` })
  },

  confirm() {
    wx.showModal({ title: '确认收货', content: '请确认已收到全部商品', success: (r) => {
      if (r.confirm) wx.showToast({ title: '已确认收货', icon: 'success' })
    }})
  },

  contact() {
    wx.makePhoneCall({ phoneNumber: '4008888888' })
  }
})
