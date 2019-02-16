// pages/member/referrals/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nums: 0,
    allnum: 0,
    jiekou: jiekou,
    user_id: '',
    num: 1,
    falg: true,
    datas: [],
    page: {},
  },
  //下线
  getAllPj: function () {
    var that = this;
    var user_id = that.data.user_id;
    var num = that.data.num;
    var pjUrl = jiekou + '/WXAPI/Personal2/myUnderLine';
    that.setData({ falg: false });
    wx.request({
      url: pjUrl,
      data: {
        user_id: user_id,
        cu_page: num,
        page_size: 6,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({ falg: true, num: num + 1 });
        if (num == 1) {
          that.setData({ datas: [] });
        }
        if (res.data.code == 0) {
          var datass = res.data.data.list;

          if (res.data.page.cu_page > res.data.page.total_page) {
            wx.showModal({
              title: '提示',
              content: '小凯找不到任何信息',
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
            nums: res.data.data.under_num,
            allnum: res.data.data.help_num,
            datas: datas,
            page: res.data.page
          })
          if (num == 1) {
            that.getInfos();
          }
        }
      }
    });
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
    this.getAllPj();
    // 页面渲染完成  
    this.getInfos();
  },
  //画图
  getInfos: function(){
    var that = this;
    //使用wx.createContext获取绘图上下文context  
    var context = wx.createContext();
    //定义角度
    var nums = that.data.nums;
    var allnum = that.data.allnum;
    //计算弧度
    var degs = nums / allnum * 360;
    //    数据源  
    var array = [360, degs, 360];
    var colors = ["#546571", "#fef9da", "#ffffff"];
    var total = 0;
    //    定义圆心坐标  
    var point = { x: 70, y: 70 };
    //    定义半径大小  
    var radius = 70;
    /*    循环遍历所有的pie */
    for (var i = 0; i < array.length; i++) {
      context.beginPath();
      //      起点弧度  
      var start = 0;
      //      1.先做第一个pie  
      //      2.画一条弧，并填充成三角饼pie，前2个参数确定圆心，第3参数为半径，第4参数起始旋转弧度数，第5参数本次扫过的弧度数，第6个参数为时针方向-false为顺时针  
      if (i == 2) {
        context.arc(point.x, point.y, 50, start, array[i] * Math.PI / 180, false);
        //      3.连线回圆心  
        context.lineTo(point.x, point.y);
        //      4.填充样式  
        context.setFillStyle(colors[i]);
        // context.setFontSize(30)
        // context.setTextAlign('center');
        // context.fillText(nums, 70, 70);
        //      5.填充动作  
        context.fill();
        context.closePath();
      } else {
        context.arc(point.x, point.y, radius, start, array[i] * Math.PI / 180, false);
        //      3.连线回圆心  
        context.lineTo(point.x, point.y);
        //      4.填充样式  
        context.setFillStyle(colors[i]);
        //      5.填充动作  
        context.fill();
        context.closePath();
      }


    }
    context.beginPath();
    //      4.填充样式  
    context.setFillStyle("#1f1f1f");
    context.setFontSize(30);
    context.setTextAlign('center');
    context.fillText(nums, 70, 85);
    //      5.填充动作  
    context.fill();
    context.closePath();
    //调用wx.drawCanvas，通过canvasId指定在哪张画布上绘制，通过actions指定绘制行为  
    wx.drawCanvas({
      //指定canvasId,canvas 组件的唯一标识符  
      canvasId: 'mypie',
      actions: context.getActions()
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
    if (falg) {
      if (page.cu_page > page.total_page) {

      } else {
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