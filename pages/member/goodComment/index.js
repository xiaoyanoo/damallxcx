// pages/member/goodComment/index.js
const app = getApp()
var jiekou = app.globalData.jiekou;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //星级设置，0开始 5满星
    indexs: 4,
    jiekou: jiekou,
    user_id: '',
    ids: '',
    datas: {},
    //选中图片数组
    image_photo: [],
    //限制选择图片的数量
    nums: 5,
    //当前上传第几张图片 ，默认下标为0开始
    uploadImgCount: 0,
    //上传后返回新图片数组
    newImg: [],
    //获取备注
    content: '',
  },
  //提交数据
  sendInfo: function (imgs) {
    var that = this;
    //获取图片数组
    var imgs = imgs;
    //获取备注信息
    var content = this.data.content;
    var order_id = this.data.ids;
    var goods_spec = this.data.spec_key;
    var goods_id = this.data.goods_id;
    var user_id = this.data.user_id;
    var goods_rank = this.data.indexs;
    var data = {
      content: content,
      imgs: imgs,
      order_id: order_id,
      goods_spec: goods_spec,
      goods_id: goods_id,
      goods_rank: goods_rank,
      user_id: user_id,
    }
    var pjUrl = jiekou + '/WXAPI/Personal2/goodsComment';
    wx.request({
      url: pjUrl,
      data: data,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功',
          })
          wx.switchTab({
            url: "../index/index"
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
    

  },
  //输入备注
  getrank_ipt: function(e){
    var value = e.detail.value;
    if(value.length> 200) {
      value = value.substring(0,199);
    }
    this.setData({
      content: value
    })
  },
  //设置星级
  setXx: function(e){
    var index = e.currentTarget.dataset.index;
    this.setData({ indexs: index });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var ids = options.ids;
    var goods_id = 0;
    var spec_key = 0;
    if (options.goods_id) {
      goods_id = options.goods_id;
    }
    if (options.spec_key) {
      spec_key = options.spec_key;
    }
    var user_id = app.globalData.user_id;
    that.setData({
      user_id: user_id,
      ids: ids,
      spec_key: spec_key,
      goods_id: goods_id,
    })
    that.getInfo();
  },
  //获取详情信息
  getInfo: function () {
    var that = this;
    var user_id = that.data.user_id;
    var ids = that.data.ids;
    var goods_spec = that.data.spec_key;
    var goods_id = that.data.goods_id;
    var pjUrl = jiekou + '/WXAPI/Personal2/getOrderDetail';
    wx.request({
      url: pjUrl,
      data: {
        user_id: user_id,
        order_id: ids,
        goods_spec: goods_spec,
        goods_id: goods_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },

      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            datas: res.data.data
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.msg,
            showCancel: true,
            success: function (res) {
              wx.navigateBack({

              })
            }
          })
        }
      }
    });
  },
  //选择图片或者拍照
  choice: function () {
    var that = this;
    var nums = that.data.nums;
    if (nums <= 0) {
      wx.showModal({
        title: '提示',
        content: '最多上传1张图片',
        showCancel: false,
        success: function (res) { }
      })
    } else {
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