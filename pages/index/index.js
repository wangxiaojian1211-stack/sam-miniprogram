const mock = require('../../utils/mock')
const app = getApp()

Page({
  data: {
    categories: mock.CATEGORIES,
    currentCat: '全部',
    products: [],
    storeSettings: mock.DEFAULT_STORE_SETTINGS,
    navStyle: '',
    banners: [
      'https://picsum.photos/seed/sam1/750/280',
      'https://picsum.photos/seed/sam2/750/280',
      'https://picsum.photos/seed/sam3/750/280',
    ]
  },

  onLoad() {
    this.setNavLayout()
  },

  setNavLayout() {
    const sys = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {}
    const statusBarHeight = sys.statusBarHeight || 20
    let navBarHeight = 44
    try {
      const menu = wx.getMenuButtonBoundingClientRect && wx.getMenuButtonBoundingClientRect()
      if (menu && menu.top) {
        navBarHeight = menu.height + (menu.top - statusBarHeight) * 2
      }
    } catch (e) {}
    this.setData({
      navStyle: `padding-top:${statusBarHeight}px;height:${navBarHeight}px;`
    })
  },

  onShow() {
    app.refreshCartCount()
    const storeSettings = mock.getStoreSettings()
    wx.setNavigationBarTitle({ title: storeSettings.storeName })
    this.setData({ products: mock.getProducts(this.data.currentCat), storeSettings })
    // 更新购物车角标
    wx.setTabBarBadge({ index: 1, text: String(app.globalData.cartCount || '') })
    if (!app.globalData.cartCount) wx.removeTabBarBadge({ index: 1 })
  },

  onCatTap(e) {
    const cat = e.currentTarget.dataset.cat
    this.setData({
      currentCat: cat,
      products: mock.getProducts(cat)
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  addCart(e) {
    const id = e.currentTarget.dataset.id
    const product = mock.getProductById(id)
    if (!product) {
      wx.showToast({ title: '商品已下架', icon: 'none' })
      return
    }
    const cart = wx.getStorageSync('cart') || []
    const idx = cart.findIndex(c => c.id === id)
    if (idx >= 0) cart[idx].count++
    else cart.push({ ...product, count: 1 })
    wx.setStorageSync('cart', cart)
    app.refreshCartCount()
    wx.setTabBarBadge({ index: 1, text: String(app.globalData.cartCount) })
    wx.showToast({ title: '已加入购物车', icon: 'success', duration: 800 })
  },

  goSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' })
  },
  goNotice() {
    wx.showToast({ title: '暂无公告', icon: 'none' })
  }
})
