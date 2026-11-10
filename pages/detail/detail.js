const mock = require('../../utils/mock')
const app = getApp()

Page({
  data: { product: {}, qty: 1, totalPrice: 0 },

  onLoad(options) {
    const product = mock.getProductById(options.id) || mock.getProductList()[0]
    if (!product) {
      wx.showToast({ title: '商品不存在或已下架', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 800)
      return
    }
    this.setData({ product, totalPrice: (product.price + product.fee).toFixed(2) })
    wx.setNavigationBarTitle({ title: product.name })
  },

  incQty() {
    const qty = this.data.qty + 1
    const p = this.data.product
    this.setData({ qty, totalPrice: ((p.price + p.fee) * qty).toFixed(2) })
  },
  decQty() {
    if (this.data.qty <= 1) return
    const qty = this.data.qty - 1
    const p = this.data.product
    this.setData({ qty, totalPrice: ((p.price + p.fee) * qty).toFixed(2) })
  },

  addCart() {
    const { product, qty } = this.data
    const cart = wx.getStorageSync('cart') || []
    const idx = cart.findIndex(c => c.id === product.id)
    if (idx >= 0) cart[idx].count += qty
    else cart.push({ ...product, count: qty })
    wx.setStorageSync('cart', cart)
    app.refreshCartCount()
    wx.setTabBarBadge({ index: 1, text: String(app.globalData.cartCount) })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  buyNow() {
    this.addCart()
    wx.switchTab({ url: '/pages/cart/cart' })
  }
})
