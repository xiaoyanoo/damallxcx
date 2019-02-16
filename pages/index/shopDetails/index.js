// pages/index/shopDetails/index.js//获取应用实例
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    none:[0,0],
    user_id: '',
    jiekou: jiekou,
    //1 为购物车 2为立即购买
    style: 0,
    ids: '',
    datas: {},
    //当前规格库存
    stock: 0,
    //当前规格价格
    price: 0,
    //当前规格的规格 例： 12_23_45
    sku_num: '',
    //当前的数量
    skuNum: 1,
    show: false,
    //评论id
    com_id: '',
    //需要回复的人的id
    reply_id: '',
    //回复的文字内容
    content: '',
    //回复状态
    falg: true,
    //回复数组中评论
    evalIndex: 0,
    is_report:0,
  },
  //隐藏输入框
  hideModel1: function(){
    this.setData({
      show: false
    })
  },
  showReport:function(e){
    var val= e.currentTarget.dataset.val;
    if(val==1){
        this.setData({
          is_report:0,
        })
    }else{
      this.setData({
        is_report: 1,
      })
    }
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
  getInfo: function(e){
    var val = e.detail.value;
    this.setData({
      content: val
    })
  },
  //发送评论
  sendInfo: function(){
    if(this.data.falg){
      var that = this;
      var user_id = that.data.user_id;
      var com_id = that.data.com_id;
      var reply_id = that.data.reply_id;
      var content = that.data.content;
      var evalIndex = that.data.evalIndex;
      if (content.length > 0){
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
              datas.evaluation[evalIndex].reply.push(data);
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
  //进去确定订单
  linkOrderPay: function(){
    var that = this;
    //商品当前的数量
    var skuNum = that.data.skuNum;
    //当前的商品id
    var ids = that.data.ids;
    //当前的用户id
    var user_id = that.data.user_id;
    //当前的商品规格
    var sku_num = that.data.sku_num;
    var num = this.data.style;
    if (num == 2) {
      var data = {
        goods_id: ids,
        goods_num: skuNum,
        goods_spec: sku_num
      }
      wx.navigateTo({
        url: '../orderPay/index?data=' + JSON.stringify(data),
      })
    }else {
      //加入购物车
      var shoucangUrl = jiekou + '/WXAPI/Homepage/addCart';
      wx.request({
        url: shoucangUrl,
        data: {
          goods_id: ids,
          user_id: user_id,
          goods_num: skuNum,
          goods_spec: sku_num
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          if (res.data.code == 0) {
            wx.showToast({
              title: res.data.msg,
              icon: 'success',
              duration: 1000
            });
            app.globalData.is_shuaxin = 1,
            that.setData({
              none: [0,0]
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              image: '../../../images/error.png',
              duration: 1000
            })
          }
        }
      });
    }
  },

  //进入购物车
  linkCar: function(){
    wx.switchTab({
      url: '../../car/index',
    })
  },
  //进入评论
  linkpjList: function(){
    var that = this;
    var ids = that.data.ids;
    var nums = that.data.datas.eva_num;
    if(nums > 0){
      wx.navigateTo({
        url: '../pjList/index?ids='+ids,
      })
    }else {
      wx.showToast({
        title: '暂无评论',
        image: '../../../images/error.png',
        duration: 1000,
      })
    }
   
  },
  //轮播图滑动
  bindchange: function(e){
    this.setData({ current: e.detail.current })
  },
  //显示选择规格kuang
  shopPayBox: function(e){
    var index = e.currentTarget.dataset.index;
    var that = this;
    that.setData({
      none: [0,1],
      style: index
    })
  },
  //显示规格
  showStyle: function(){
    var that = this;
    that.setData({
      none:[1,0]
    })
  },
  //隐藏模态框
  hideModel: function(){
    var that = this;
    that.setData({
      none: [0, 0]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var ids = options.ids;
    var user_id = app.globalData.user_id;
    this.setData({ ids: ids, user_id: user_id});
    this.getDetails();
  },
  //获取商品详情信息
  getDetails: function () {
    var that = this;
    var ids = that.data.ids;
    var user_id = that.data.user_id;
    var getDetailsUrl = jiekou + '/WXAPI/Homepage/goodsInfo';
    wx.request({
      url: getDetailsUrl,
      data: { 
        goods_id: ids,
        user_id: user_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          var datas = res.data.data;
          if (datas.sku.sku_num) {
            var sku_num = datas.sku.sku_num.split('_');
            //遍历所有规格
            for (var j = 0; j < datas.spec.length; j++) {
              //遍历所有规格下的规格
              for (var x = 0; x < datas.spec[j].child.length; x++) {
                //遍历默认规格
                for (var i = 0; i < sku_num.length; i++) {
                  //判断所有小规格是否与本次循环的id相同，则改变状态
                  if (sku_num[i] == datas.spec[j].child[x].child_value) {
                    datas.spec[j].child[x].status = 1;
                  }
                }
              }
            }
            var price = datas.sku.price;
            var stock = datas.sku.stock;
            var sku_num = datas.sku.sku_num;
          }else {
            var sku_num = 0;
            var stock = datas.stock;
            var price = datas.price;
          }
          that.setData({
            datas: datas,
            //当前规格库存
            stock: stock,
            //当前规格价格
            price: price,
            //当前规格的规格 例： 12_23_45
            sku_num: sku_num,
          })
        }
      }
    });
  },
  //收藏商品
  shoucang: function(e){
    var that = this;
    var status = e.currentTarget.dataset.status; 
    var datas = that.data.datas;
    var user_id = that.data.user_id;
    var ids = that.data.ids;
    if(user_id){
      if (status == 1) {
        var shoucangUrl = jiekou + '/WXAPI/Personal2/cancleCollect';
        wx.request({
          url: shoucangUrl,
          data: {
            goods_id: ids,
            user_id: user_id
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 0) {
              wx.showToast({
                title: res.data.msg,
                icon: 'success',
                duration: 1000
              });
              datas.is_collect = 0;
              that.setData({
                datas: datas
              })
            } else {
              wx.showToast({
                title: res.data.msg,
                image: '../../../images/error.png',
                duration: 1000
              })
            }
          }
        });
       
      } else {
        //收藏商品
        var shoucangUrl = jiekou + '/WXAPI/Personal2/collect';
        wx.request({
          url: shoucangUrl,
          data: {
            goods_id: ids,
            user_id: user_id
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            if (res.data.code == 0) {
              wx.showToast({
                title: res.data.msg,
                icon: 'success',
                duration: 1000
              });
              datas.is_collect = 1;
              that.setData({
                datas: datas
              })
            }else {
              wx.showToast({
                title: res.data.msg,
                image: '../../../images/error.png',
                duration: 1000
              })
            }
          }
        });
      }
      
    }else {
      wx.showToast({
        title: '请登录',
        image: '../../../images/error.png',
        duration: 1000
      })
    }
    
  },
  //选择规格
  selectSpec: function(e){
    var that = this;
    var index = e.currentTarget.dataset.index; 
    var indexs = e.currentTarget.dataset.indexs;
    var datas = that.data.datas;
    var spec = datas.spec;
    for (var i = 0; i < spec[indexs].child.length; i++) {
      if (i == index){
        spec[indexs].child[i].status = 1;
      }else {
        spec[indexs].child[i].status = 0;
      }
    }
    var specArr = [];
    for (var i = 0; i < spec.length; i++) {
      for (var j = 0; j < spec[i].child.length; j++) {
        if (spec[i].child[j].status == 1) {
          specArr.push(spec[i].child[j].child_value);
        }
      }
    }
    that.setData({
      datas: datas,
      sku_num: specArr.join('_')
    });
    //根据规格获取价格和库存
    var getspecUrls = jiekou + '/WXAPI/Homepage/specGoodsPrice';
    wx.request({
      url: getspecUrls,
      data: {
        spec: specArr.join('_')
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          var datass = res.data.data;
          that.setData({
            //当前规格库存
            stock: datass.stock,
            //当前规格价格
            price: datass.price,
          })
        }
      }
    });
  },
  //添加数量/删除数量
  addNum: function (e) {
    var that = this;
    var skuNum = that.data.skuNum;
    var stock = that.data.stock;
    skuNum++;
    if (stock <= skuNum) {
      skuNum = stock;
    }
    that.setData({ skuNum: skuNum});
  },
  delNum: function (e) {
    var that = this;
    var skuNum = that.data.skuNum;
    if (skuNum == 1) {
      skuNum = 1;
    } else {
      skuNum--;
    }
    that.setData({ skuNum: skuNum });
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
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    var datas = this.data.datas;
    console.log(datas.goods_id)
    return {
      title: datas.name,
      path: '/pages/index/index?scene=' + datas.goods_id+',6',
      imageUrl: datas.original_img,
    }
  }
})