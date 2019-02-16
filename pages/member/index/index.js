// pages/member/index/index.js
const app = getApp()
var jiekou = app.globalData.jiekou
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:[],
    user_id:'',
    jiekou: jiekou,
    user_info: {},
  },
  //进入会员
  linkmember: function(){
    wx.navigateTo({
      url: '../member/index',
    })
  },
  //进入订单
  orderList: function(e){
    var nums = e.currentTarget.dataset.num; 
    wx.navigateTo({
      url: '../orderList/index?nums=' + nums,
    })
  },
  //进入折扣
  linkDioscount: function(){
    wx.navigateTo({
      url: '../dioscount/index',
    })
  },
  myChoujiang:function(){
    //获取最新的订单id
    wx.request({
      url: jiekou + '/index.php/WXAPI/Homepage/newOrder', //仅为示例，并非真实的接口地址
      data: { user_id: app.globalData.user_id},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 0) {
          wx.navigateTo({
            url: '../../index/luckDruw/index?ids=' + res.data.data.master_order_sn,
          })
        } else {
          if (res.data.code == 400) {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
            })

          }
        }
      }
    });
    
  },
  //进入设置
  linkSetup: function(){
    wx.navigateTo({
      url: '../setup/index',
    })
  },
  //进入转盘礼品
  turntable: function(){
    wx.navigateTo({
      url: '../turntable/index',
    })
  },
  //进入我的评论
  linkComment: function(){
    wx.navigateTo({
      url: '../conment/index',
    })
  },
  //进入消息推送
  linkNews: function(){
    wx.navigateTo({
      url: '../news/index',
    })
  },
  //进入我的下线
  linkReferrals: function(){
    var that = this;
    wx.navigateTo({
      url: '../referrals/index',
    })
  },
  //进入佣金提现
  linkCommission: function(){
    var that = this;
    wx.navigateTo({
      url: '../commission/index',
    })
  },
  //进入我的预定
  linkMyReservation: function(){
    var that = this;
    wx.navigateTo({
      url: '../myReservation/index',
    })
  },
  //进入我的收藏
  btnMyShoucang: function () {
    var that = this;
    wx.navigateTo({
      url: '../myShoucang/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user_id = app.globalData.user_id;
    var user_info = app.globalData.userInfo;
    this.setData({
      user_id: user_id,
      user_info: user_info,
    })
  },
  //测试点击登录授权
  login(userinfo, callback) {

    // console.log(userinfo.detail.encryptedData)
    app.globalData.encryptedData = userinfo.detail.encryptedData;
    app.globalData.userInfo = userinfo.detail.userInfo;
    app.globalData.iv = userinfo.detail.iv;
    wx.login({}) // 现在，调用 wx.login 是一个可选项了。只有当你需要使用微信登录鉴别用户，才需要用到它，用来获取用户的匿名识别符

    if (userinfo.detail.errMsg == 'getUserInfo:ok') {
      // 将用户信息、匿名识别符发送给服务器，调用成功时执行 callback(null, res)
      var that = this;
      app.getOpenId(function () {
        var session_key = app.globalData.session_key;
        var openId = app.globalData.openid;
        // console.log('session_key' + session_key)
        wx.request({
          url: jiekou + '/index.php/WXAPI/User/validateOpenid', //仅为示例，并非真实的接口地址
          data: { openid: openId },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 200) {
              // console.log('login' + res.data.data)
              app.getUserInfo()
              getApp().globalData.userInfo = res.data.data;
              getApp().globalData.login = true;

              getApp().globalData.user_id = res.data.data.user_id;
              that.onLoad();


            } else {
              if (res.data.code == 400) {
                // console.log("need register");

                app.registerceshi(function () {

                  getApp().globalData.login = true;
                  that.setData({
                    user_id: app.globalData.user_id
                  })
                  that.onLoad();
                });
              }
            }
          }
        });

      });


    }
    else if (userinfo.detail.errMsg == 'getUserInfo:fail auth deny') { // 当用户点击拒绝时
      wx.showModal({
        title: '授权失败'
      }) // 提示用户，需要授权才能登录

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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})