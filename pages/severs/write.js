const app = getApp();
const _ = require('../../utils/friend/underscore');
const listener = require('../../utils/friend/listener');
const _Data = require('../../utils/friend/data');
const requestUtil = require('../../utils/friend/requestUtil');

const QQMapWX = require('../../utils/friend/qqmap-wx-jssdk.min.js');// 引入SDK核心类
const qqmapsdk = new QQMapWX({ key: '7DWBZ-XEW6R-HGGWQ-WZYXJ-FZUAV-MBBDY' });// 实例化API核心类
var array = [];
var owerId = '33aef7e0ac1b11e6af9f142d27fd7e9e';
var albumId;
Page({
  host_url: _Data.ekcms_root_api_url,
  cid: 0,//分类ID
  uploadedFiles: [],//已上传的文件列表
  uploadedFilesState: {},//已上传的文件列表
  data: {
    pictures: [],
    disableBtnPush: true,
  },
  /**
   * 页面被加载
   */
  onLoad: function (options) {
    console.log(this.data.host_url)
    this.setData({
      host_url: _Data.ekcms_root_api_url
    })
    var ut = wx.getStorageSync("utoken");
    var ui = wx.getStorageSync("user_info");
    if (!ut || !ui) {
      app.getUserInfo();
    }
    this.cid = options.cid;
    this.title = options.title;
    if (this.title) {
      wx.setNavigationBarTitle({
        title: this.title + ' - 发布',
      });
    }
    // if (!this.cid || this.cid < 0) {
    //   wx.showModal({
    //     title: '错误提示',
    //     content: '非法打开页面，请退出后重试~',
    //     showCancel: false,
    //     success: function (res) {
    //       wx.navigateBack();
    //     },
    //   });
    //   return;
    // }
    var that=this
    //获取位置信息
    wx.getSetting({
      success: (res) => {
        console.log(res);
        console.log(res.authSetting['scope.userLocation']);
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {//非初始化进入该页面,且未授权
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
            success: function (res) {
              if (res.cancel) {
                console.info("授权失败");

              } else if (res.confirm) {
                //village_LBS(that);
                wx.openSetting({
                  success: function (data) {
                    console.log(data);
                    if (data.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 5000
                      })
                      //再次授权，调用getLocationt的API
                      wx.getLocation({
                        success: (res) => {
                          console.log(res)
                          qqmapsdk.reverseGeocoder({
                            location: {
                              latitude: res.latitude,
                              longitude: res.longitude
                            },
                            success: (res) => {
                              res = res.result;
                              that.setData({
                                address: res.address,
                                latitude: res.location.lat,
                                longitude: res.location.lng
                              });
                            },
                            fail: function (res) {
                            }
                          });
                        },
                      });

                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'success',
                        duration: 5000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {//初始化进入
          wx.getLocation({
            success: (res) => {
              console.log(res)
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                success: (res) => {
                  res = res.result;
                  that.setData({
                    address: res.address,
                    latitude: res.location.lat,
                    longitude: res.location.lng
                  });
                },
                fail: function (res) {
                }
              });
            },
          });
        }else{
          wx.getLocation({
            success: (res) => {
              console.log(res)
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                success: (res) => {
                  res = res.result;
                  that.setData({
                    address: res.address,
                    latitude: res.location.lat,
                    longitude: res.location.lng
                  });
                },
                fail: function (res) {
                }
              });
            },
          });
        }
      }
    })
    
    this.setData({ mobile: wx.getStorageSync('servers_mobile') });
    this.loadConfig(this.loadCategory);
  },
  onShow:function(){
    this.loadConfig(this.loadCategory);
  },
  /**
   * 加载配置数据
   */
  loadConfig: function (callback) {
    requestUtil.get(_Data.ekcms_services_config, _.extend({ fabuye: 1 }), (info) => {
      // if (info.u_phone_status == 'must_verify_phone') {
      //   wx.showModal({
      //     content: '请先验证手机',
      //     showCancel: false,
      //     success: function (res) {
      //       if (res.confirm == true) {
      //         wx.navigateTo({
      //           url: '../store/store-phone-binding/index',
      //         })
      //       }
      //     }
      //   })
      //   return;
      // }
      if (info.plase_set_aliyunOSS_config==1){
        wx.showModal({
          content: '请到后台配置阿里云OSS设置',
          showCancel: false,
          success: function (res) {
            if (res.confirm == true) {
              wx.navigateBack()
            }
          }
        })
        return;
      }
      const data = { config: info };
      if (info.top_rule.length) {
        const rule = info.top_rule[0];
        data.top_day = rule.day;
        data.top_amount = rule.amount;
      }
      if(info.phone && !this.data.mobile){
        data.mobile=info.phone;
      }
      this.setData(data);
      callback && callback.apply(this);
    });
  },
  /**
   * 加载分类数据
   */
  loadCategory: function (callback) {
    requestUtil.get(_Data.ekcms_services_category_info, { id: this.cid }, (info) => {
      this.setData({ cate: info, disableBtnPush: false });
      callback && callback.apply(this);
    });
  },
  /**
   * 打开地图
   */
  onOpenMapTap: function (e) {
    wx.chooseLocation({
      success: (res) => {
        // console.log(res)
        this.setData({
          address: res.address, 
          latitude: res.latitude,
          longitude: res.longitude
        });

      }
    });
  },
  /**
   * 打开图片
   */
  onOpenPictureTap: function (e) {
    var that=this;
     
    wx.chooseImage({
      count: 6 - this.data.pictures.length, 
      // sizeType: ['original', 'compressed'],
      // sourceType: ['album', 'camera'],
      success: (res) => {
        
            wx.showToast({
              icon: "loading",
              title: "正在上传"
            });

            var successUp = 0; //成功个数
            var failUp = 0; //失败个数
            var length = res.tempFilePaths.length; //总共个数
            var i = 0; //第几个
            this.uploadDIY(res.tempFilePaths, successUp, failUp, i, length);
       

          // wx.uploadFile({
          //   url: _Data.my_root_url + "Article/up_img",
          //   filePath: res.tempFilePaths[0],
          //   name: 'file',
          //   header: { "Content-Type": "multipart/form-data" },
          //   formData: {
          //     //和服务器约定的token, 一般也可以放在header中
          //     // 'session_token': wx.getStorageSync('session_token')
          //   },
          //   success: function (res) {
              // var data = JSON.parse(res.data);
          //     console.log(data);
              
          //     if (res.statusCode != 200) {
          //       wx.showModal({
          //         title: '提示',
          //         content: '上传失败1',
          //         showCancel: false
          //       })
          //       return;
          //     }
              // const pictures = that.data.pictures.concat(data.data);
              // that.setData({ pictures: _.uniq(pictures) });

          //   },
          //   fail: function (e) {
          //     console.log(e);
          //     wx.showModal({
          //       title: '提示',
          //       content: '上传失败2',
          //       showCancel: false
          //     })
          //   },
          //   complete: function () {
          //     wx.hideToast();  //隐藏Toast
          //   }
          // })
        
      }
    });
  },
  uploadDIY(filePaths, successUp, failUp, i, length) {
    var that=this;
    wx.uploadFile({
      url: _Data.my_root_url + "Article/up_img",
      filePath: filePaths[i],
      name: 'file',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        'pictureUid': owerId,
        'pictureAid': albumId
      },
      success: (resp) => {
        successUp++;
        var data = JSON.parse(resp.data);
        const pictures = that.data.pictures.concat(data.data);
        that.setData({ pictures: _.uniq(pictures) });
      },
      fail: (res) => {
        failUp++;
      },
      complete: () => {
        i++;
        if (i == length) {
          wx.showToast({icon: "success",
            title: "上传成功"});
        }
        else {  //递归调用uploadDIY函数
          that.uploadDIY(filePaths, successUp, failUp, i, length);
        }
      },
    });
  },
  /**
   * 预览图片
   */
  onPreviewTap: function (e) {
    if (this.isDeleteAction) return;
    const dataset = e.currentTarget.dataset, index = dataset.index;
    wx.previewImage({
      current: this.data.pictures[index],
      urls: this.data.pictures,
    });
  },
  /**
   * 删除选择的图片
   */
  onDeleteImgTap: function (e) {
    this.isDeleteAction = true;
    const dataset = e.currentTarget.dataset, index = dataset.index;
    wx.showActionSheet({
      itemList: ['删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          const pictures = this.data.pictures, key = this.getFilename(pictures[index]);
          pictures.splice(index, 1);
          delete this.uploadedFilesState[key];
          this.setData({ pictures: this.data.pictures });
        }
      }, complete: () => {
        this.isDeleteAction = false;
      }
    })
  },
  /**
   * 置顶天数已改变
   */
  onTopDayChange: function (e) {
    const rules = this.data.config.top_rule, index = parseInt(e.detail.value);
    if (rules.length == 0) return;

    this.setData({ top_day: rules[index].day, top_amount: rules[index].amount });
  },
  /**
   * 开启置顶
   */
  onIsTopChange: function (e) {
    this.setData({ is_top: e.detail.value ? 1 : 0 });
  },
  /**
   * 提交数据
   */
  onPushSubmit: function (e) {
    const pictures = this.data.pictures
    // console.log(pictures);return;
    if (requestUtil.isLoading(this.pushRQId)) return;

    //提交文本
      const values = _.extend({ cid: this.cid }, e.detail.value);
      values.open_id = app.globalData.openid;
     
      var imgs='';
      if(pictures){
        for (var i = 0; i < pictures.length;i++){
          if(imgs==''){
            imgs=pictures[i];
          }else{
            imgs +='|'+ pictures[i];
          }
        }
      }
      values.imgs = imgs;
      console.log(values)
      this.pushRQId = requestUtil.post(_Data.ekcms_services_document_write, values, (info) => {
        listener.fireEventListener('severs.info.add', [info]);
        // wx.setStorageSync('servers_mobile', values.mobile);
        // console.log(11)
        if (info== 'ok') {
          //是否开启支付
          // if (info.is_pay == 1 || info.is_top) {
          //   this.onPayment(info);
          // } else {
          //   //跳转我的发布
          //   wx.redirectTo({ url: 'my-lists', });
          // }
          
          // wx.redirectTo({ url: 'index' });
          wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: 2000,
            success:function(){
              wx.navigateBack({ changed: true }); 
            }
          })
          
        }
      });
  },
  /**
   * 上传文件
   */
upload:function(index) {
  const pictures = this.data.pictures
  console.log(_Data.my_root_url);
    wx.showToast({
      icon: "loading",
      title: "正在上传"
    }),
    wx.uploadFile({
      url: _Data.my_root_url + "Article/up_img",
      filePath: pictures[index],
      name: 'file',
      header: { "Content-Type": "multipart/form-data" },
      formData: {
        //和服务器约定的token, 一般也可以放在header中
        // 'session_token': wx.getStorageSync('session_token')
      },
      success: function (res) {
        console.log(res);
        if (res.statusCode != 200) {
          wx.showModal({
            title: '提示',
            content: '上传失败1',
            showCancel: false
          })
          return;
        }
      },
      fail: function (e) {
        console.log(e);
        wx.showModal({
          title: '提示',
          content: '上传失败2',
          showCancel: false
        })
      },
      complete: function () {
        wx.hideToast();  //隐藏Toast
      }
    })
  },
  /**
   * 获取文件名
   */
  getFilename: function (filepath) {
    var patt = new RegExp('(.*\/)*([^.]+).*', "gi");
    return patt.exec(filepath)[2];
  },
  /**
   * 支付
   */
  onPayment: function (docInfo) {
    requestUtil.get(_Data.ekcms_services_document_pay, { id: docInfo.id }, (info) => {
      const handler = () => {
        docInfo.is_pay = 2;
        docInfo.status = 1;
        listener.fireEventListener('severs.info.update', [docInfo]);

        wx.showToast({ title: '已审核通过...', icon: 'success' });
        wx.switchTab({ url: 'index' });
      };

      if (info === 1) {
        handler();
      } else {
        wx.requestPayment(_.extend(info, {
          success: handler,
          fail: () => {
            wx.redirectTo({ url: 'my-lists', });
          }
        }));
      }
    }, this, {
        error: () => {
          wx.redirectTo({ url: 'my-lists', });
        }
      });
  }
})