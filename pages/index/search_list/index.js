// pages/index/search/index.js
//获取应用实例
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiekou: jiekou,
    user_id: '',
    datas: [],
    page: {},
    num :1,
    falg: true,
    val: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user_id = app.globalData.user_id;
    var type=options.type;
    this.setData({
      user_id: user_id,
      type:type,
    })
  },
  //输入框输入事件
  setSearchText: function(e){
    var val = e.detail.value;
    this.setData({
      val: val
    })
  },
  getGoods: function(){
    var val = this.data.val;
    if(val){
      this.setData({
        num :1,
        datas: [],
      })
      var num = this.data.num;
      var data = {
        page_size: 6,
        cu_page: num,
        key_word: val
      }
      this.getListShop(data);
    }else {
      wx.showToast({
        title: '请输入关键字',
      })
    }
  },
  //获取商品列表
  getListShop: function (data) {
    var datass = data;
    var that = this;
    var numss = that.data.num;
    var getListShopurls = jiekou + '/WXAPI/Homepage/goodsList';
    that.setData({ flag: false });
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: getListShopurls,
      data: datass,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({
          page: res.data.page,
          falg: true,
        })
        if (res.data.code == 0) {
          var datas = that.data.datas;
          var guessLike = res.data.data;
          if (guessLike.length > 0) {
            for (var i = 0; i < guessLike.length; i++) {
              datas.push(guessLike[i]);
            }
          }else {
            if(numss == 1){
              wx.showToast({
                title: '暂无商品',
                image: '../../../images/error.png'
              })
            }
          }
          that.setData({
            datas: datas,
            page: res.data.page,
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
        that.setData({ num: numss + 1 });
      }
    });
  },
  //进入详情页
  linkDetails: function (e) {
    var that = this;
    var ids = e.currentTarget.dataset.id;
    if (ids) {
      wx.navigateTo({
        url: '../shopDetails/index?ids=' + ids,
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var num = that.data.num;
    var page = that.data.page;
    var falg = that.data.falg;
    if (falg) {
      if (page.cu_page == page.total_page) {
        wx.showToast({
          title: '没有更多了~',
          image: '../../../images/error.png',
          duration: 1000,
        })
      } else {
        wx.showLoading({
          title: '正在加载',
        })
        setTimeout(function () {
          var val = this.data.val;
          var num = this.data.num;
          var data = {
            page_size: 6,
            cu_page: num,
            key_word: val
          }
          this.getListShop(data);
        }, 500);
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})