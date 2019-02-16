// pages/member/member/index.js
const app = getApp()
var jiekou = app.globalData.jiekou
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiekou : jiekou,
    user_id:'',
    datas: {},
    vip: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user_id = app.globalData.user_id;
    this.setData({
      user_id: user_id
    })
    this.getInfo();
  },
  //接收会员信息
  getInfo: function(){
    var that = this;
    var user_id = that.data.user_id;
    var urls = jiekou + '/WXAPI/Personal2/getVip';
    wx.request({
      url: urls,
      data: {
        user_id: user_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if(res.data.code == 0) {
          for(var i = 0; i < res.data.data.vip; i++) {
            if(res.data.data.vip[i].status == 1) {
              var index = i;
              that.setData({
                vip: index
              })
            }
          }
          that.setData({
            datas:res.data.data
          })
        }else {
          wx.showModal({
            title: '错误提示',
            content: res.data.msg,
          })
        }
      }
    });
  },
  //进入我的下线
  linkReferrals: function () {
    var that = this;
    wx.navigateTo({
      url: '../referrals/index',
    })
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
  // onShareAppMessage: function () {
  
  // }
})