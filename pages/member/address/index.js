// pages/member/address/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //地区
    region: '',
    //详细地址
    ress: '',
    //联系人电话
    mobile: '',
    //联系人名称
    name: '',
    //地址id
    ids: 0,
    jiekou: jiekou,
    user_id: '',
  },
  bindRegionChange: function(e){
    var datas = e.detail.value;
    datas = datas[0] + ' ' + datas[1] + ' ' + datas[2];
    this.setData({
      region: datas
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var show = '';
    if(options.show == 0 || options.show == 3){
      show = options.show;
    }
    var that = this;
    var user_id = app.globalData.user_id;
    var ids = '';
    if(options.ids){
      ids = options.ids;
    }
    this.setData({
      ids: ids,
      user_id: user_id,
      show: show
    })
    if(ids == 0) {
      wx.setNavigationBarTitle({
        title: "新增收货地址"
      })
    }else {
      wx.setNavigationBarTitle({
        title: "编辑收货地址"
      })
      that.getAddress();
    }
  },
  //弹框
  showAlert: function(msg){
    wx.showModal({
      title: '提示',
      content: msg,
    })
  },
  //保存地址信息
  saveRess: function(){
    var that = this;
    var address_id = that.data.ids;
    var consignee = that.data.name;
    var mobile = that.data.mobile;
    var address1 = that.data.region;
    var address2 = that.data.ress;
    var user_id = that.data.user_id;
    if (!consignee) {
      that.showAlert('请填写联系人姓名');
    } else if (!mobile){
      that.showAlert('请填写联系人电话');
    } else if (!address1) {
      that.showAlert('请选择地区');
    } else if (!address2) {
      that.showAlert('请输入详细地址');
    } else if (address2.length < 5) {
      that.showAlert('详细地址不能少于五个字');
    }else {
      var getUrls = jiekou + '/WXAPI/Personal/addOrEditAddress';
      wx.request({
        url: getUrls,
        data: {
          address_id: address_id,
          address1: address1,
          phone: mobile,
          name: consignee,
          address: address2,
          user_id: user_id,
          is_default: 1
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.showToast({
              title: '操作成功',
            });
            setTimeout(function(){
              wx.hideToast();
              wx.navigateBack();
              var pages = getCurrentPages();
              // var prevPage = pages[pages.length - 1] 
              var prevPage = pages[pages.length - 2]  //上一个页面
              var show = that.data.show;
              if(show == 3) {
                show = 0
              }else {
                show = 1;
              }
              prevPage.setData({
                show: show,
                shua: 1,
                address_id: res.data.data
              })
            },500);
          }else {
            that.showAlert(res.data.msg);
          }
        }
      });
    }
    
  },
  //获取地址信息
  getAddress: function(){
    var that = this;
    var ids = that.data.ids;
    var getUrls = jiekou + '/WXAPI/Personal/getAddress';
    wx.request({
      url: getUrls,
      data: {
        address_id: ids
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            region: res.data.data.address1,
            ress: res.data.data.address2,
            mobile: res.data.data.mobile,
            name: res.data.data.consignee,
            ids: res.data.data.address_id,
          })
        }
      }
    });
  },
  //设置联系人名字
  setName: function(e){
    var val = e.detail.value;
    this.setData({
      name: val
    })
  },
  //设置联系人电话
  setPhone: function (e) {
    var val = e.detail.value;
    this.setData({
      mobile: val
    })
  },
  //设置详细地址
  setRess: function (e) {
    var val = e.detail.value;
    this.setData({
      ress: val
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
  onShareAppMessage: function () {
  
  }
})