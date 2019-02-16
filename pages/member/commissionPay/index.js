// pages/member/commission/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiekou: jiekou,
    user_id: '',
    //提现总金额
    all_fee: 0,
    //选中图片数组
    image_photo: [],
    //限制选择图片的数量
    nums: 1,
    //当前上传第几张图片 ，默认下标为0开始
    uploadImgCount: 0,
    //上传后返回新图片数组
    newImg: [],
    //提现金额
    price: 0,
  },
  //设置金额
  setPrice: function(e){
    var val = e.detail.value;
    this.setData({
      price: val
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var all_fee = 0.00;
    if(options.num){
      all_fee = options.num;
    }
    var user_id = app.globalData.user_id;
    this.setData({
      user_id: user_id,
      all_fee: all_fee
    })
  },
  //选择图片或者拍照
  choice: function () {
    var that = this;
    var nums = that.data.nums;
    if(nums <= 0){
      wx.showModal({
        title: '提示',
        content: '最多上传1张图片',
        showCancel: false,
        success: function (res) { }
      })
    }else {
      wx.chooseImage({
        count: nums, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          var tempFilePaths = res.tempFilePaths;
          var newNums = nums - tempFilePaths.length;
          that.setData({
            nums: newNums,
            textHidden: true,
            image_photo: tempFilePaths,
            photoHidden: false
          })
        }
      })
    }
  },
  //上传单张图片
  uploadPhoto: function (uploadImgCount, call) {
    var that = this;
    var uploadImgCount = uploadImgCount;
    var uploadImgUrls = jiekou + '/WXAPI/Article/up_img';
    var image_photo = that.data.image_photo;
    wx.uploadFile({
      url: uploadImgUrls,
      filePath: image_photo[uploadImgCount],
      name: 'file',
      formData: {
        'imgIndex': uploadImgCount
      },
      header: {
        "Content-Type": "multipart/form-data"
      },
      success: function (res) {
        uploadImgCount++;
        var newImg = that.data.newImg;
        newImg.push(JSON.parse(res.data).data)
        that.setData({
          uploadImgCount: uploadImgCount,
          newImg: newImg,
        })
        //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }
        //如果是最后一张,则隐藏等待中  
        if (uploadImgCount == image_photo.length) {
          wx.hideToast();
          var newImgstr = newImg.join(',');
          console.log(newImg)
          that.sendInfo(newImgstr);
        } else {
          if (call) {
            call();
          }
        }
      },
      fail: function (res) {
        wx.hideToast();
        wx.showModal({
          title: '错误提示',
          content: '上传图片失败',
          showCancel: false,
          success: function (res) { }
        })
      }
    });

  },
  //提交数据
  sendInfo: function (imgs) {
    var that = this;
    //获取图片数组
    var imgs = imgs;
    var user_id = this.data.user_id;
    //获取提现金额
    var price = this.data.price;
    //最大提现金额
    var all_fee = this.data.all_fee;
    console.log(imgs);
    if (price <= 0 || price > all_fee){
      wx.showModal({
        title: '提示',
        content: '请输入有效金额',
      })
    } else if (!imgs){
      wx.showModal({
        title: '提示',
        content: '请上传收款码',
      })
    }else {
      var data = {
        img: imgs,
        user_id: user_id,
        money: price
      }
      wx.showLoading({
        title: '正在提交',
      })
      var pjUrl = jiekou + '/WXAPI/Personal2/save_cash';
      wx.request({
        url: pjUrl,
        data: data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 0) {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: true,
              success: function(res){
                wx.switchTab({
                  url: "../index/index"
                })
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.msg,
              showCancel: true,
            })
          }
        }
      });
    }
  },
  //点击提交
  sendInfoBtn: function () {
    var that = this;
    var image_photo = that.data.image_photo;
    if (image_photo.length > 0) {
      var uploadImgCount = that.data.uploadImgCount;
      that.uploadPhoto(uploadImgCount, function () {
        that.sendInfoBtn();
      });
    } else {
      that.sendInfo('');
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