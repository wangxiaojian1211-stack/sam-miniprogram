const mock = require('../../utils/mock')

const DEFAULT_NEW_PRODUCT = {
  name: '',
  category: '烘焙甜点',
  price: '',
  fee: '',
  img: '',
  unit: '件',
  spec: '',
  hot: false,
  active: true,
  desc: '商家新增商品，可根据实际情况补充说明。'
}

Page({
  data: {
    products: [],
    activeCount: 0,
    settings: mock.DEFAULT_STORE_SETTINGS,
    productCategories: mock.CATEGORIES.filter(c => c !== '全部'),
    newCategoryIndex: 0,
    showAddForm: false,
    newProduct: Object.assign({}, DEFAULT_NEW_PRODUCT)
  },

  onShow() {
    this.setData({ settings: mock.getStoreSettings() })
    this.loadProducts()
  },

  loadProducts() {
    const products = mock.getProductList({ includeInactive: true }).map(p => ({
      ...p,
      totalPrice: (Number(p.price || 0) + Number(p.fee || 0)).toFixed(2)
    }))
    this.setData({
      products,
      activeCount: products.filter(p => p.active !== false).length
    })
  },

  onSettingInput(e) {
    const field = e.currentTarget.dataset.field
    const settings = Object.assign({}, this.data.settings, {
      [field]: e.detail.value
    })
    this.setData({ settings })
  },

  toggleAddForm() {
    this.setData({ showAddForm: !this.data.showAddForm })
  },

  onNewProductInput(e) {
    const field = e.currentTarget.dataset.field
    const newProduct = Object.assign({}, this.data.newProduct, {
      [field]: e.detail.value
    })
    this.setData({ newProduct })
  },

  onNewCategoryChange(e) {
    const index = Number(e.detail.value || 0)
    const category = this.data.productCategories[index] || this.data.productCategories[0]
    const newProduct = Object.assign({}, this.data.newProduct, { category })
    this.setData({ newCategoryIndex: index, newProduct })
  },

  refreshTotals(products) {
    const next = products.map(p => ({
      ...p,
      totalPrice: (Number(p.price || 0) + Number(p.fee || 0)).toFixed(2)
    }))
    this.setData({
      products: next,
      activeCount: next.filter(p => p.active !== false).length
    })
  },

  onFieldInput(e) {
    const { id, field } = e.currentTarget.dataset
    const value = Number(e.detail.value || 0)
    const products = this.data.products.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    )
    this.refreshTotals(products)
  },

  toggleActive(e) {
    const id = e.currentTarget.dataset.id
    const products = this.data.products.map(p =>
      p.id === id ? { ...p, active: e.detail.value } : p
    )
    this.refreshTotals(products)
  },

  chooseProductImage(e) {
    const id = e.currentTarget.dataset.id
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0]
        if (!file || !file.tempFilePath) return
        this.saveImageToLocal(id, file.tempFilePath)
      },
      fail: () => {
        wx.chooseImage({
          count: 1,
          sourceType: ['album', 'camera'],
          success: (res) => {
            const path = res.tempFilePaths && res.tempFilePaths[0]
            if (path) this.saveImageToLocal(id, path)
          }
        })
      }
    })
  },

  chooseNewProductImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0]
        if (!file || !file.tempFilePath) return
        this.saveNewImageToLocal(file.tempFilePath)
      },
      fail: () => {
        wx.chooseImage({
          count: 1,
          sourceType: ['album', 'camera'],
          success: (res) => {
            const path = res.tempFilePaths && res.tempFilePaths[0]
            if (path) this.saveNewImageToLocal(path)
          }
        })
      }
    })
  },

  saveNewImageToLocal(tempFilePath) {
    wx.saveFile({
      tempFilePath,
      success: (res) => this.updateNewProductImage(res.savedFilePath),
      fail: () => this.updateNewProductImage(tempFilePath)
    })
  },

  updateNewProductImage(img) {
    this.setData({
      newProduct: Object.assign({}, this.data.newProduct, { img })
    })
  },

  saveImageToLocal(id, tempFilePath) {
    wx.saveFile({
      tempFilePath,
      success: (res) => this.updateProductImage(id, res.savedFilePath),
      fail: () => this.updateProductImage(id, tempFilePath)
    })
  },

  updateProductImage(id, img) {
    const products = this.data.products.map(p =>
      p.id === id ? { ...p, img } : p
    )
    this.refreshTotals(products)
  },

  addProduct() {
    const item = Object.assign({}, this.data.newProduct)
    item.name = (item.name || '').trim()
    item.spec = (item.spec || '').trim()
    item.unit = (item.unit || '').trim() || '件'
    item.price = Number(item.price || 0)
    item.fee = Number(item.fee || 0)
    item.category = item.category || this.data.productCategories[0]
    if (!item.name) {
      wx.showToast({ title: '请填写商品名称', icon: 'none' })
      return
    }
    if (!item.spec) {
      wx.showToast({ title: '请填写商品规格', icon: 'none' })
      return
    }
    if (!item.price) {
      wx.showToast({ title: '请填写售价', icon: 'none' })
      return
    }
    item.id = `custom_${Date.now()}`
    item.img = item.img || `https://picsum.photos/seed/${item.id}/300/300`
    item.active = true
    item.hot = false
    const products = [item, ...this.data.products]
    mock.saveProductList(products.map(p => {
      const saved = Object.assign({}, p)
      delete saved.totalPrice
      saved.price = Number(saved.price || 0)
      saved.fee = Number(saved.fee || 0)
      saved.active = saved.active !== false
      return saved
    }))
    this.refreshTotals(products)
    this.setData({
      newProduct: Object.assign({}, DEFAULT_NEW_PRODUCT),
      newCategoryIndex: 0,
      showAddForm: false
    })
    wx.showToast({ title: '已添加并生效', icon: 'success' })
  },

  saveProducts() {
    const products = this.data.products.map(p => {
      const item = Object.assign({}, p)
      delete item.totalPrice
      item.price = Number(item.price || 0)
      item.fee = Number(item.fee || 0)
      item.active = item.active !== false
      return item
    })
    mock.saveProductList(products)
  },

  saveSettings() {
    const settings = Object.assign({}, this.data.settings)
    settings.storeName = (settings.storeName || '').trim() || mock.DEFAULT_STORE_SETTINGS.storeName
    settings.heroTitle = (settings.heroTitle || '').trim() || mock.DEFAULT_STORE_SETTINGS.heroTitle
    settings.heroDesc = (settings.heroDesc || '').trim() || mock.DEFAULT_STORE_SETTINGS.heroDesc
    mock.saveStoreSettings(settings)
    this.setData({ settings })
    wx.showToast({ title: '基础信息已保存', icon: 'success' })
  },

  saveProductItem(e) {
    const id = e.currentTarget.dataset.id
    const product = this.data.products.find(p => p.id === id)
    if (!product) return
    if (!product.name) {
      wx.showToast({ title: '商品名称不能为空', icon: 'none' })
      return
    }
    const products = this.data.products.map(p => {
      const item = Object.assign({}, p)
      delete item.totalPrice
      item.price = Number(item.price || 0)
      item.fee = Number(item.fee || 0)
      item.active = item.active !== false
      return item
    })
    mock.saveProductList(products)
    wx.showToast({ title: '本商品已保存', icon: 'success' })
  },

  resetProducts() {
    wx.showModal({
      title: '恢复默认商品',
      content: '将清空商家调整过的价格和上下架状态，是否继续？',
      success: (res) => {
        if (!res.confirm) return
        wx.removeStorageSync('admin_products')
        this.loadProducts()
        wx.showToast({ title: '已恢复默认', icon: 'success' })
      }
    })
  }
})
