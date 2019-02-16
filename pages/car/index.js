// pages/goods/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiekou: jiekou,
    allPri: 0,
    status: 1,
    falgNum: 0,
    //是否能执行加载
    falg: true,
    num: 1,
    page: {},
    datas: [],
    idsstr: '',
    show: 0,
  },
  //获取总价格
  allPrice: function(){
    var that = this;
    var datas = that.data.datas;
    var allPri = 0;
    var falgNum = 0;
    var idsstr = '';
    var idsarr = [];
    for (var i = 0; i < datas.length; i++){
      for (var j = 0; j < datas[i].goodsList.length; j++) {
        if (datas[i].goodsList[j].status == 0) {
          idsarr.push(datas[i].goodsList[j].cart_id);
          falgNum += parseInt(datas[i].goodsList[j].goods_num);
          allPri += datas[i].goodsList[j].goods_num * datas[i].goodsList[j].price;
        }
      }
    }
    if (idsarr.length > 0) {
      idsstr = idsarr.join(',');
    }
    that.setData({ allPri: allPri.toFixed(2), falgNum: falgNum, idsstr: idsstr });
  },
  //进入确认订单
  linkOrderPay: function(){
    var idsstr = this.data.idsstr;
    if (this.data.allPri > 0) {
      var data = {
        ids: idsstr
      }
      app.globalData.is_shuaxin = 1;
      wx.navigateTo({
        url: '../index/orderPay/index?data=' + JSON.stringify(data),
      })
    }else {
      wx.showModal({
        title: '提示',
        content: '您还未选择结算商品',
      })
    }
  },
  //判断选项框的状态
  falgBtn: function(){
    var that = this;
    var datas = that.data.datas;
    var numAll = 0;
    var numlength = 0;
    for (var i = 0; i < datas.length; i++) {
      var num = 0;
      for (var j = 0; j < datas[i].goodsList.length; j++) {
        //计算总商品数量
        numlength++;
        if (datas[i].goodsList[j].status == 0) {
          //总选中商品数量
          numAll++;
          //当前店铺总选中商品数量
          num++;
        }
      }
      //当前数量相等
      if (datas[i].goodsList.length == num) {
        datas[i].status = 0;
        that.setData({ datas: datas });
      }else {
        datas[i].status = 1;
        that.setData({ datas: datas });
      }
    }
    if (numlength > 0) {
      if (numlength == numAll) {
        that.setData({ status: 0 });
      } else {
        that.setData({ status: 1 });
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var user_id = app.globalData.user_id;
    that.setData({
      user_id: user_id,
    })
    var is_shuaxin = app.globalData.is_shuaxin;
    if (is_shuaxin != 1) {
      that.cartList(function () {
        that.setData({
          falg: true
        })
      });
    }
    
  },
  //购物车列表
  cartList: function (call) {
    var that = this;
    var num = that.data.num;
    var user_id = that.data.user_id;
    var cartListUrls = jiekou + '/WXAPI/Homepage/cartList';
    that.setData({
      falg: false,
      show: 1,
    })
    wx.request({
      url: cartListUrls,
      data: { 
        cu_page: num,
        page_size: 5,
        user_id: user_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            page: res.data.page,
          })
          var datas = that.data.datas;
          var data = res.data.data;
          typeof(call) == 'function' ? call() : '';
          if (res.data.page.cu_page > res.data.page.total_page){
            wx.showToast({
              title: '全部加载完毕~',
              image: '../../images/error.png',
              duration: 1000,
            })
          }
          if(data.length > 0) {
            num++;
            for(var i = 0; i < data.length; i++) {
              datas.push(data[i]);
            }
            that.setData({
              datas: datas,
              page: res.data.page,
              num: num
            })
            
          }
          that.allPrice();
          that.falgBtn(); 
        }
      }
    });
  },
  //删除商品
  delShop: function(e){
    var that = this;
    var indexs = e.currentTarget.dataset.indexs;
    var datas = that.data.datas;
    var falg = that.data.falg;
    var cart_arr = [];
    var cart_str = '';
    var goodsList = datas[indexs].goodsList;
    for (var i = 0; i < goodsList.length; i++) {
      if (goodsList[i].status == 0){
        cart_arr.push(goodsList[i].cart_id);
      }
    }
    if (cart_arr.length > 0) {
      cart_str = cart_arr.join(',');
    }
    if(falg){
      if (cart_arr.length <= 0) {
        wx.showModal({
          title: '提示',
          content: '请选择要删除的商品',
        })
        return;
      }
      wx.showModal({
        title: '确认删除订单',
        content: '订单删除将不能恢复！',
        confirmColor: '#f25c5c',
        success: function (res) {
          if (res.confirm) {
            that.setData({falg: false});
            var delCarList = jiekou + '/WXAPI/Homepage/delCart';
            wx.request({
              url: delCarList,
              data: {
                cart_id: cart_str
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                if (res.data.code == 0) {
                  wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                  })
                  wx.hideToast();
                  that.setData({ datas: [] ,num: 1});
                  that.cartList(function () {
                    that.setData({falg: true,num: 2});
                  })
                }else {
                  that.setData({falg: true});
                  wx.showModal({
                    title: '错误提示',
                    content: res.data.msg,
                    confirmColor: '#f25c5c',
                  });
                }
              }
            });
          } else {

          }
        }
      })
    }
    
  },
  //点击全部选中与反选
  selectBtnAll: function(){
    var that = this;
    var datas = that.data.datas;
    var status = that.data.status;
    for (var i = 0; i < datas.length; i++) {
      for (var j = 0; j < datas[i].goodsList.length; j++) {
        if (status == 1) {
          datas[i].goodsList[j].status = 0;
        }else {
          datas[i].goodsList[j].status = 1;
        }
      }
    }
    that.setData({ datas: datas });
    that.allPrice();
    that.falgBtn(); 
  },
  //单个店铺商品选中与反选
  selectBtnMax: function(e){
    var that = this;
    var indexs = e.currentTarget.dataset.indexs;
    var datas = that.data.datas;
    var status = that.data.status;
    for (var j = 0; j < datas[indexs].goodsList.length; j++) {
      if (datas[indexs].status == 1) {
        datas[indexs].goodsList[j].status = 0;
      } else {
        datas[indexs].goodsList[j].status = 1;
      }
    }
    that.setData({ datas: datas });
    that.allPrice();
    that.falgBtn(); 
  },
  //点击单个商品选中与反选
  selectBtnMin: function(e){
    var that = this;
    var index = e.currentTarget.dataset.index;
    var indexs = e.currentTarget.dataset.indexs;
    var datas = that.data.datas;
    if (datas[indexs].goodsList[index].status == 0){
      datas[indexs].goodsList[index].status = 1;
    }else {
      datas[indexs].goodsList[index].status = 0;
    }
    that.setData({ datas: datas});
    that.allPrice();
    that.falgBtn();
  },
  //添加数量/删除数量
  addNum: function (e) {
    var that = this;
    var falg = that.data.falg;
    if (falg) {
      that.setData({ falg: false });
      var index = e.currentTarget.dataset.index;
      var indexs = e.currentTarget.dataset.indexs;
      var datas = that.data.datas;
      var nums = datas[indexs].goodsList[index].goods_num;
      nums++;
      datas[indexs].goodsList[index].goods_num = nums;
      var cart_id = datas[indexs].goodsList[index].cart_id;
      var cartNumUrl = jiekou + '/WXAPI/Homepage/cartNum';
      wx.request({
        url: cartNumUrl,
        data: {
          cart_id: cart_id,
          goods_num: datas[indexs].goodsList[index].goods_num
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({ datas: datas ,falg: true});
            that.allPrice();
            that.falgBtn();
          }
        }
      });
    }
    
  },
  delNum: function(e){
    var that = this;
    var falg = that.data.falg;
    if(falg) {
      that.setData({falg: false });
      var index = e.currentTarget.dataset.index;
      var indexs = e.currentTarget.dataset.indexs;
      var datas = that.data.datas;
      var nums = datas[indexs].goodsList[index].goods_num;
      if (nums == 1) {
        datas[indexs].goodsList[index].goods_num = 1;
      } else {
        nums--;
        datas[indexs].goodsList[index].goods_num = nums;
      }
      var cart_id = datas[indexs].goodsList[index].cart_id;
      var cartNumUrl = jiekou + '/WXAPI/Homepage/cartNum';
      wx.request({
        url: cartNumUrl,
        data: {
          cart_id: cart_id,
          goods_num: datas[indexs].goodsList[index].goods_num
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({ datas: datas,falg: true });
            that.allPrice();
            that.falgBtn();
          }
        }
      });
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
    var that = this;
    var is_shuaxin = app.globalData.is_shuaxin;
    if (is_shuaxin == 1) {
      that.setData({
        num: 1,
        falg: true,
        datas: [],
        allPri: '0.00',
        falgNum: 0,
        idsstr: '',
        status: 1,
      })
      that.cartList(function () {
        app.globalData.is_shuaxin = 0,
        that.setData({
          falg: true
        })
      });
    }
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
      if (page.cu_page > page.total_page) {
        
      } else {
        wx.showLoading({
          title: '正在加载',
        })
        setTimeout(function () {
          that.setData({ num: num + 1 });
          that.cartList(function(){
            that.setData({ falg:true});
            
          });
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