App({
  onLaunch: function () {

  },
  toastSuccess: function (showTitle) {
    wx.showToast({
      title: showTitle,
      icon: 'none', //success loading none
      //image: '/images/notice.png', 
      duration: 3000,
    })
  },
})
