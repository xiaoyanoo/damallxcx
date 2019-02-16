// pages/index/shopList/index.js
//获取应用实例
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ids: '',
    jiekou: jiekou,
    num: 1,
    datas: [],
    rank_type: 0,
    falg: true,
    price_type: 3,
  },
  //进入商品xiangq
  linkShopDetails: function(e){
    var that = this;
    var ids = e.currentTarget.dataset.id; 
    wx.navigateTo({
      url: '../shopDetails/index?ids=' + ids,
    })
  },
  //获取商品分类rank_type
  getList: function(e){
    var that = this;
    var rank_type = e.currentTarget.dataset.rank_type; 
    var rank_type_old = that.data.rank_type;
    if (rank_type == 3) {
      that.setData({ num: 1 ,price_type: 2});
    } else if (rank_type == 2){
      that.setData({ num: 1, price_type: 3});
    }
    that.setData({ rank_type: rank_type, num: 1, });
    that.getGoods();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var ids = options.ids;
    var user_id = app.globalData.user_id;
    that.setData({ ids: ids, user_id: user_id});
    that.getGoods();
  },
  //筛选列表
  getGoods: function(){
    var that = this;
    var data = {};
    data.cu_page = that.data.num;
    data.page_size = 6;
    data.user_id= that.data.user_id;
    data.cat_id2 = that.data.ids;
    data.rank_type = that.data.rank_type;
    if (that.data.num == 1) {
      that.setData({datas: []});
    }
    that.getListShop(data);
  },
  //获取商品列表
  getListShop: function(data){
    var datass = data;
    var that = this;
    var getListShopurls = jiekou + '/WXAPI/Homepage/goodsList';
    that.setData({flag: false});
    wx.request({
      url: getListShopurls,
      data: datass ,
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
          }
          that.setData({
            datas: datas,
            page: res.data.page,
          })
        }else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
          })
        }
      }
    });
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
    if(falg){
      if (page.cu_page == page.total_page){
        wx.showModal({
          title: '提示',
          content: '小凯是有底线的哦',
          image: '../../../images/error.png',
          duration: 1000,
        })
      }else {
        wx.showLoading({
          title: '正在加载',
        })
        setTimeout(function(){
          that.setData({ num: num + 1 });
          that.getGoods();
        },500);
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})