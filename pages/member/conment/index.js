// pages/goods/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    currentTab: 0,
    navList: ['我的评论', '评论我的'],
    datas: [[], []],
    jiekou: jiekou,
    user_id: '',
    num: [1, 1],
    falg: true,
  },
  //进入商品详情{普通}
  linkDetails: function (e) {
    var ids = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../index/shopDetails/index?ids=' + ids,
    })
  },
  //进入商品详情｛预定｝
  linkDetails1: function (e) {
    var ids = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../../index/shopDetails1/index?ids=' + ids,
    })
  },
  /** 
     * 滑动切换tab 
     */
  bindChange: function (e) {
    var that = this;
    var num = e.detail.current;
    that.setData({
      navScrollLeft: num * 90,
      currentTab: num
    })

  },
  swichNav: function (e) {

    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  //选项卡到底部
  bindDownLoad: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var falg = that.data.falg;
    var page = that.data.page;
    if (falg) {
      if (page.cu_page > page.total_page) {

      } else {
        that.getList(index);
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = app.globalData.user_id;
    this.setData({
      user_id: user_id
    })
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res)
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });

    //调用收藏列表
    that.getList(0);
    that.getList(1);
  },
  getList: function (types) {
    var that = this;
    var data = {};
    var types = types;
    var user_id = that.data.user_id;
    var num = that.data.num;
    data.user_id = user_id;
    data.type = types;
    data.cu_page = num[types];
    data.page_size = 6;
    that.getShoucang(data, function () {
      num[types] = parseInt(num[types]) + 1;
      that.setData({
        num: num,
        falg: true,
      })
    });

  },
  //获取收藏列表
  getShoucang: function (data, call) {
    var data = data;
    var types = data.type;
    var that = this;
    var dataList = that.data.datas;
    var advertiseUrls = jiekou + '/WXAPI/Personal2/myComment';
    that.setData({ falg: false });
    wx.request({
      url: advertiseUrls,
      data: data,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({
          page: res.data.page
        })
        var page = res.data.page;
        if (call) {
          call();
        }
        if (page.cu_page > page.total_page) {
          wx.showModal({
            title: '提示',
            content: '小凯是有底线的哦',
            image: '../../../images/error.png',
            duration: 1000,
          })
        }
        if (res.data.code == 0) {
          var datas = res.data.data;
          if (datas.length > 0) {
            for (var i = 0; i < datas.length; i++) {
              dataList[types].push(datas[i]);
            }
            that.setData({
              datas: dataList
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})