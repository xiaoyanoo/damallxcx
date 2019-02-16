// pages/index/list/index.js
//获取应用实例
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ids: 0,
    catName:'请选择分类',
    jiekou: jiekou,
    getHomePageCat: [],
    catId:0,//一级分类
    catId2:0,//二级分类
    getHomePageCatList: [],
    falg: true,
    msg: '',
    totalPage:0,//商品总页数
    p:1,
  },
  //进去商品列表
  linkShopList: function(e){
    var that = this;
    var ids = e.currentTarget.dataset.id; 
    wx.navigateTo({
      url: '../shopList/index?ids=' + ids,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var ids = options.ids;
    var that = this;
    that.setData({ids:ids});
    that.getHomePageCat(ids);
    that.getHomePageCatList(ids);
  },
  //点击一级获取二级分类
  getShopList: function(e){
    var that = this;
    var ids = e.currentTarget.dataset.id; 
    var falg = that.data.falg;
    if(falg){
      that.setData({ids: ids});
      that.getHomePageCatList(ids);
    }
  },

//点击一级获取二级分类（小靑年）
getGoodsCat_Two:function(e){
  var that = this;
  this.setData({ catId: e.currentTarget.dataset.id,p:1});
  that.getHomePageCatList(e.currentTarget.dataset.id);
},
//点击二级分类设置分类名（小靑年）
getCatGoods:function(e){
  this.setData({ 
    catName: e.currentTarget.dataset.name,
    cat_id2: e.currentTarget.dataset.id,
    p:1,
    goodsList:[]
    });
  this.getCatGoodsList(this.data.p);
},
  //获取商品一级分类
  getHomePageCat: function (ids) {
    var that = this;
    var getHomePageCatUrls = jiekou + '/WXAPI/Homepage/getHomePageCat';
    wx.request({
      url: getHomePageCatUrls,
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          var getHomePageCat = res.data.data;
          that.setData({
            getHomePageCat: getHomePageCat,
            catId: getHomePageCat[0].cat_id
          })
          // console.log(ids == '' || ids == undefined)
          
          if (ids == '' || ids == undefined) {
            that.getHomePageCatList(getHomePageCat[0].cat_id);
          }
        }
      }
    });
  },
  //获取商品二级分类
  getHomePageCatList: function (ids) {
    var that = this;
    that.setData({falg: false});
    var getHomePageCatListUrl = jiekou + '/WXAPI/Homepage/getHomePageCat';
    wx.request({
      url: getHomePageCatListUrl,
      data: { cat_id1: ids},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
      
        that.setData({ falg: true, msg: '', getHomePageCatList: []});
        if (res.data.code == 0) {
          if (Array.isArray(res.data.data)){
            var getHomePageCatList = res.data.data;
            that.setData({
              getHomePageCatList: getHomePageCatList,
            })
          }else {
            that.setData({
              msg: res.data.msg,
            })
          }
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
    var p = this.data.p;
    if(p<this.data.totalPage){
      p = p++;
      this.getCatGoodsList(p);
      this.setData({
        p:p
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})