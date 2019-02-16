// pages/index/pjList/index.js
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
    num: 1,
    page: {},
    datas:[],
    falg: true,
    //评论id
    com_id: '',
    //需要回复的人的id
    reply_id: '',
    //回复的文字内容
    content: '',
    //回复数组中评论
    evalIndex: 0,
  },
  //隐藏输入框
  hideModel1: function () {
    this.setData({
      show: false
    })
  },
  //显示输入框
  showModel1: function (e) {
    var user_id = this.data.user_id;
    //评论id
    var com_id = e.currentTarget.dataset.com_id;
    //回复者的id
    var reply_id = e.currentTarget.dataset.uid;
    var evalIndex = e.currentTarget.dataset.index;
    this.setData({
      show: true,
      com_id: com_id,
      reply_id: reply_id,
      evalIndex: evalIndex,
    })
  },
  //输入框输入文字
  getInfo: function (e) {
    var val = e.detail.value;
    this.setData({
      content: val
    })
  },
  //发送评论
  sendInfo: function () {
    if (this.data.falg) {
      var that = this;
      var user_id = that.data.user_id;
      var com_id = that.data.com_id;
      var reply_id = that.data.reply_id;
      var content = that.data.content;
      var evalIndex = that.data.evalIndex;
      if (content.length > 0) {
        that.setData({
          falg: false
        })
        var infoUrl = jiekou + '/WXAPI/Homepage/replyComment';
        wx.request({
          url: infoUrl,
          data: {
            user_id: user_id,
            com_id: com_id,
            reply_id: reply_id,
            content: content
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            that.setData({
              falg: true,
            });
            if (res.data.code == 0) {
              wx.showToast({
                title: '成功',
                icon: 'success',
                duration: 500
              });
              var data = res.data.data;
              var datas = that.data.datas;
              datas[evalIndex].reply.push(data);
              that.setData({
                show: false,
                datas: datas,
                falg: true,
              });
            } else {

              wx.showToast({
                title: res.data.msg,
                image: '../../../images/error.png',
                duration: 1500
              })
            }
          }
        });
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var ids = options.ids;
    var num = that.data.num;
    var user_id = app.globalData.user_id;
    that.setData({
      ids: ids,
      user_id: user_id
    })
    that.getAllPj();
  },
  //获取全部评价
  getAllPj: function(){
    var that = this;
    var ids = that.data.ids;
    var num = that.data.num;
    var pjUrl = jiekou + '/WXAPI/Homepage/goodsEvaluation';
    that.setData({falg: false});
    wx.request({
      url: pjUrl,
      data: {
        goods_id: ids,
        cu_page: num,
        page_size: 6,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({ falg: true, num: num+ 1});
        if(num == 1) {
          that.setData({ datas: [] });
        }
        if (res.data.code == 0) {
          var datass = res.data.data;
          if (res.data.page.cu_page > res.data.page.total_page) {
            wx.showToast({
              title: '没有数据了~',
              image: '../../../images/error.png',
              duration: 1000,
              mask: true,
            })
          }
          var datas = that.data.datas;
          if (datass.length > 0) {
            for(var i = 0; i < datass.length; i++) {
              datas.push(datass[i]);
            }
          }
          that.setData({
            datas: datas,
            page: res.data.page
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
    var falg = that.data.falg;
    var page = that.data.page;
    if(falg){
      if (page.cu_page > page.total_page) {
        
      }else {
        that.getAllPj();
      }
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})