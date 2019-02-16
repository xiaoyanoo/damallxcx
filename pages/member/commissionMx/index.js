// pages/member/turntable/index.js
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
    Tab:0,
    p:1,
    totalPage:1,
    not_account:[],
    CancelAccount:[],
    falg: true,
    datas: [],
    page: {},
  },
  //获取明细
  getAllPj: function () {
    var that = this;
    var user_id = that.data.user_id;
    var num = that.data.num;
    var pjUrl = jiekou + '/WXAPI/Personal2/distrNotic';
    that.setData({ falg: false });
    wx.showLoading({
      title: '正在加载',
    })
    wx.request({
      url: pjUrl,
      data: {
        user_id: user_id,
        // user_id: 840,
        cu_page: num,
        page_size: 6,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        that.setData({ falg: true, num: num + 1 });
        if (num == 1) {
          that.setData({ datas: [] });
        }
        if (res.data.code == 0) {
          var datass = res.data.data;
          if (res.data.page.cu_page > res.data.page.total_page) {
            wx.showToast({
              title: '暂无数据',
              image: '../../../images/error.png',
              duration: 1000,
              mask: true,
            })
          }
          var datas = that.data.datas;
          if (datass.length > 0) {
            for (var i = 0; i < datass.length; i++) {
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
   * 切换选项卡
   */
  changeTab:function(e){
    var Tab = e.currentTarget.dataset.id;

    this.setData({
      Tab:Tab,
      p:1
    })
    if(Tab==0||Tab==1){
      this.getnot_account();
    }
  },
  /**
   * 获取未到账佣金/取消佣金列表
   */
  getnot_account:function(){
    var that = this;
    var cu_page = this.data.p;
    var user_id = this.data.user_id;
    // var user_id = 840;
    if (this.data.Tab==0){
      var dataUrl = jiekou + '/WXAPI/Personal2/not_account';
    }
    if(this.data.Tab==1){
      var dataUrl = jiekou + '/WXAPI/Personal2/CancelAccount';
    }
    wx.request({
      url: dataUrl,
      data:{
        user_id:user_id,
        cu_page: cu_page
      },
      header: { 'content-type': 'application/json'},
      success:function(res){
        console.log(res);
        that.setData({
          totalPage: res.data.total_page         
        })
        if(res.data.status==1){
          if(that.data.Tab==0){
            if (cu_page == 1) {
              that.setData({
                not_account: res.data.info
              })
            } else {
              that.setData({
                not_account: that.data.not_account.concat(res.data.info)
              })
            }
          }
          if(that.data.Tab==1){
            if (cu_page == 1) {
              that.setData({
                CancelAccount: res.data.info
              })
            } else {
              that.setData({
                CancelAccount: that.data.not_account.concat(res.data.info)
              })
            } 
          }
          
          
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user_id = app.globalData.user_id;
    this.setData({
      user_id: user_id
    })
    this.getAllPj();
    if(this.data.Tab==0){
      this.getnot_account();
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
    var p = that.data.p;
    var Tab = that.data.Tab;
    var falg = that.data.falg;
    var page = that.data.page;
    if (falg) {
      if (page.cu_page > page.total_page) {

      } else {
        that.getAllPj();
      }
    }
    if (Tab == 0 || Tab==1){
      if(p>=that.data.totalPage){

      }else{
        var p = p+1;
        that.setData({
          p:p
        })
        that.getnot_account();
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})