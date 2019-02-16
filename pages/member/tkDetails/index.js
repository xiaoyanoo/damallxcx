// pages/member/tkDetails/index.js
const app = getApp()
var jiekou = app.globalData.jiekou
Page({

  /**
   * 页面的初始数据
   */
  data: {
    none: 0,
    user_id: '',
    datas: {},
    jiekou: jiekou,
    //定义退款原因信息
    tkInfo: [],
    //选中图片数组
    image_photo: [],
    //限制选择图片的数量
    nums: 5,
    //当前上传第几张图片 ，默认下标为0开始
    uploadImgCount: 0,
    //上传后返回新图片数组
    newImg: [],
    disable: true,
    //选择退款原因后的id
    cause_type: '',
    //退款备注
    content: '',
    //退款原因文字
    tkTitle: '',
  },
  //提交数据
  sendInfo: function (imgs) {
    var that = this;
    //获取图片数组
    var imgs = imgs;
    //获取备注信息
    var content = this.data.content;
    //订单id
    var order_id = this.data.ids;
    //商品规格
    var goods_spec = this.data.spec_key;
    //商品id
    var goods_id = this.data.goods_id;
    var user_id = this.data.user_id;
    //退款原因id
    var cause_type = this.data.cause_type;
    if (cause_type == '') {
      wx.showModal({
        title: '提示',
        content: '请选择退款原因',
      })
    }else {
      wx.showLoading({
        title: '正在提交',
      })
      var data = {
        return_desc: content,
        return_imgs: imgs,
        order_id: order_id,
        spec_key: goods_spec,
        goods_id: goods_id,
        user_id: user_id,
        return_type: 0,
        cause_type: cause_type,
      }
      var pjUrl = jiekou + '/WXAPI/Personal2/returnsOrder';
      wx.request({
        url: pjUrl,
        data: data,
        header: {
          'content-type': 'application/json' // 默认值
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          wx.hideLoading();
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
              success: function(res){
                wx.navigateBack({
                  
                })
              }
            })
          }
        }
      });
    }
    
  },
  //获取退款原因
  getTk: function(e){
    var ids = e.currentTarget.dataset.id;
    var title = e.currentTarget.dataset.title;
    this.setData({
      cause_type: ids,
      tkTitle: title,
      none: 0
    })
  },
  //输入备注(限制200文字)
  getrank_ipt: function (e) {
    var value = e.detail.value;
    if (value.length > 200) {
      value = value.substring(0, 199);
    }
    this.setData({
      content: value
    })
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
    that.getTkInfo();
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
  //获取退款原因类型
  getTkInfo: function(){
    var that = this;
    var urls = jiekou + '/WXAPI/Homepage/returnReason';
    wx.request({
      url: urls,
      data: {},
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            tkInfo: res.data.data
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
  uploadPhoto: function (uploadImgCount,call) {
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
        }else {
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
  sendInfoBtn: function(){
    var that = this;
    var image_photo = that.data.image_photo;
    if (image_photo.length > 0) {
      var uploadImgCount = that.data.uploadImgCount;
      that.uploadPhoto(uploadImgCount,function(){
        that.sendInfoBtn();
      });
    }else {
      that.sendInfo('');
    }
  },
 
  //隐藏模态框
  hideModle: function () {
    this.setData({
      none: 0,
      disable: true,
    })
  },
  //显示模态框
  showModle: function () {
    this.setData({
      disable: false,
      none: 1
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