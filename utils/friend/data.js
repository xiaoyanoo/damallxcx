var HOST_URL = "https://kl2015.com/WXAPI/";//改为你的网址，必须是https开头，结尾不带/
var user_token = "gh_8144ede85111";//小程序原始ID,在微信小程序后台-设置-基本设置
var ROOT_URL = "https://kl2015.com/";//https://sx.sxnet.cc/http://localhost/tongcheng2/http://tongchengshop.sxnet.cc
var app_config_version = 1.1;
module.exports = {
  ekcms_host_api_url: HOST_URL,
  ekcms_root_api_url: ROOT_URL,
  ekcms_user_token: user_token,
  ekcms_share_info: '',
  ekcms_config_version: app_config_version,

  ekcms_services_config: HOST_URL + "/index.php?s=/api/config/config",
  ekcms_get_share_data_url: HOST_URL + "/index.php?s=/api/config/getShareInfo",
  ekcms_services_categorys: HOST_URL + "/index.php?s=/api/category/index",
  ekcms_services_documents: HOST_URL + "Article/index",
  ekcms_services_documentInfo: HOST_URL + "Article/documentInfo",
  ekcms_services_comment_add: HOST_URL + "Comment/apply",
  ekcms_services_comment_lists: HOST_URL + "Comment/lists",
  ekcms_services_category_info: HOST_URL + "/index.php?s=/api/category/categoryInfo",
  ekcms_services_document_write: HOST_URL + "Article/documentWrite",
  ekcms_services_upload: HOST_URL + "/index.php?s=/api/config/upload",
  ekcms_auth_login_url: HOST_URL + "/index.php?s=/api/login/index",
  ekcms_get_userinfo: HOST_URL + "/index.php?s=/api/config/getuserinfo",
  ekcms_services_documentGood: HOST_URL + "Comment/documentGood",
  ekcms_services_jubao: HOST_URL + "Comment/jubao",
  ekcms_services_banner: HOST_URL + "Index/home2",
  ekcms_services_documentDel: HOST_URL + "/index.php?s=/api/article/documentDel",
  ekcms_services_pullblack: HOST_URL + "/index.php?s=/api/article/pullBlack",
  ekcms_services_top: HOST_URL + "/index.php?s=/api/article/toggleTop",
  ekcms_services_untop: HOST_URL + "/index.php?s=/api/article/untop",
  ekcms_user_info_post_url: HOST_URL + "/index.php?s=/api/user/editUserInfo",
  ekcms_user_info_url: HOST_URL + "/index.php?s=/api/user/getUserInfo",
  ekcms_get_user_menu_url: HOST_URL + "/index.php?s=/api/user/getUserMenuList",
  ekcms_services_my_documents: HOST_URL + "Article/myDocuments",
  my_root_url: HOST_URL,







  
}