// components/alphabet-order-list/alphabet-order-list.js
// 通讯录组件，来源博主：https://blog.csdn.net/Honiler/article/details/82929111
Component({

  //可设置属性
  properties: {
    source: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal) { //prop 属性被设置的时候触发
        if (newVal != undefined && newVal.length > 0){
          this.setData({
            dataSource: this._groupby(newVal)
          })
        }
      }
    },
    checkType: {//选择类型，checkBox-多选类型 radio-单选类型 空字符串-常规类型
      type: String,
      value: '',
      observer: function (newVal, oldVal) {
        this.setData({
          checkType: newVal,
        })
        console.log('checkType---->', this.data.checkType);
      }
    },
    bottomHeight: {//是否需要底部留空，默认0
      type: Number,
      value: '',
      observer: function (newVal, oldVal) {
        this.setData({
          bottomHeight: newVal,
        })
        console.log('bottomHeight---->', this.data.bottomHeight);
      }
    },
    searchHeight:{//有搜索栏的化，初始化其高度
      type: Number,
      value: 0,
      observer: function (newVal, oldVal) {
        this.setData({
          searchHeight: newVal,
        })
        console.log('searchHeight---->', this.data.searchHeight);
        //重新初始化右侧letter栏
        this._ready();
      }
    },
    groupKey: String,
    imageKey: String,
    imageStyle: String,
    textKey: String, //姓名
    textStyle: String,
    positionKey: String, //职位
    positionStyle: String,
    phoneKey: String, //手机号
    phoneStyle: String,
    tagStyle: String, //左侧字母tag样式
    checkValue: String, //选中后返回的值的key
    checkStatus: String, //选中状态的key
    checkIcon: String, //右侧icon图标提示，如待审核icon
    showPoundSign: { //字母导航列表是否显示‘#’号
      type: Boolean,
      value: false,
      observer: function (newVal, oldVal) {
        console.log(newVal)
        console.log(oldVal)
        var alphabet = this.data.alphabet
        if (newVal) {
          if (alphabet.length == 26) {
            alphabet.push('PoundSign')
            this.setData({
              alphabet: alphabet
            })
          }
        } else {
          if (alphabet.length > 26) {
            alphabet.splice(26, 1)
            this.setData({
              alphabet: alphabet
            })
          }
        }

      }
    },
  },

  //内部数据源
  data: {
    alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    startTouchAlphabet: false,
    touchLetter: '', //点击选择的字母
    letterHeight: 0, //每个字母的高度
    dataSource: [], //数据源
    checkType: '', //选择类型，checkBox-多选类型 radio-单选类型 空字符串-常规类型
    bottomHeight: 0, //是否需要底部留空，默认0，使用于有tabbar里的页面使用
    searchHeight: 0, //搜索栏高度，无搜索栏则为0，有则需要设置，否则点击右侧letter不准确
  },

  //在组件在视图层布局完成后执行
  ready: function () {
    this._ready();
  },

  //一些事件
  methods: {
    
    //初始化letterHeight
    _ready:function(){
      if (wx.createSelectorQuery) {
        var that = this;
        var query = wx.createSelectorQuery().in(this);
        //添加节点的布局位置的查询请求。相对于显示区域，以像素为单位。其功能类似于 DOM 的 getBoundingClientRect。
        query.select('#alphabet').boundingClientRect(function (res) {
          if (res != null) {
            console.log('ready boundingClientRect', res);
            if (res.height) { //节点的高度
              that.setData({
                letterHeight: (res.height - that.data.searchHeight) / that.data.alphabet.length
              })
            } else {
              throw ('Initialization failed.')
            }
          }
        }).exec()
      } else {
        throw ('当前基础库版本小于1.6.0，不支持alphabet-order-list组件')
      }
    },

    _compare: function (key) {
      return function (o, p) {
        if (typeof o === "object" && typeof p === "object" && o && p) {
          var a = o[key]
          var b = p[key]
          if (a == '' || a == null || a == undefined) {
            a = String.fromCharCode(91)
          } else if (a[0] >= 'a' && a[0] <= 'z') {
            a = a.replace(a[0], String.fromCharCode(a[0].charCodeAt() - 32))
          } else if (a[0] < 'A' || a[0] > 'Z') {
            a = a.replace(a[0], String.fromCharCode(a[0].charCodeAt() + 91))
          }
          if (b == '' || b == null || b == undefined) {
            b = String.fromCharCode(91)
          } else if (b >= 'a' && b <= 'z') {
            b = b.replace(b[0], String.fromCharCode(b[0].charCodeAt() - 32))
          } else if (b[0] < 'A' || b[0] > 'Z') {
            b = b.replace(b[0], String.fromCharCode(b[0].charCodeAt() + 91))
          }
          if (a === b) {
            return 0
          }
          if (typeof a === typeof b) {
            return a < b ? -1 : 1
          }
          return typeof a < typeof b ? -1 : 1
        }
        throw ("Error type.")
      }
    },

    _sort: function (array, key) {
      return array.sort(this._compare(key))
    },

    _groupby: function (array) {
      if (!array || array.length == 0) {
        return
      }
      var key = this.properties.groupKey
      array = this._sort(array, key)
      var tag = '';
      if (array[0][key]) tag = array[0][key][0];
      if (tag >= 'a' && tag <= 'z') {
        tag = String.fromCharCode(tag.charCodeAt() - 32)
      }
      var results = [{
        'tag': tag >= 'A' && tag <= 'Z' ? tag : 'PoundSign',
        'data': [array[0]]
      }]
      for (var i = 1, j = 0; i < array.length; i++) {
        var tag = '';
        if (array[i][key]) tag = array[i][key][0]
        if(tag >= 'a' && tag <= 'z') {
          tag = String.fromCharCode(tag.charCodeAt() - 32)
        }
        if (tag >= 'A' && tag <= 'Z') {
          if (tag == results[j]['tag']) {
            results[j]['data'].push(array[i])
          } else {
            j++
            results.push({
              'tag': tag,
              'data': [array[i]]
            })
          }
        } else {
          if (results[j]['tag'] != 'PoundSign') {
            j++
            results.push({
              'tag': 'PoundSign',
              'data': [array[i]]
            })
          } else {
            results[j]['data'].push(array[i])
          }
        }
      }
      return results
    },

    _itemtap: function (e) {
      this.triggerEvent('itemtap', { 'item': e.currentTarget.dataset.item }, {})
    },

    _copyphonekey: function (e) {
      wx.setClipboardData({
        data: e.currentTarget.dataset.phone,
        success(res) {
          wx.getClipboardData({
            success(res) {
              console.log('setClipboardData', res.data) // data
              wx.showToast({
                title: res.data + '复制成功',
                icon: 'none', 
                duration: 3000,
              })
            }
          })
        }
      })
    },

    _checkboxchange: function (e) {
      console.log('_checkboxchange >>>>>', e)
      this.triggerEvent('checkboxchange', { 'item': e.detail.value }, {})
      
    },

    _radiochange: function (e) {
      this.triggerEvent('radiochange', { 'item': e.detail.value }, {})
    },

    _letterTouchStartEvent: function (e) {
      this.setData({
        startTouchAlphabet: true,
        touchLetter: this.data.alphabet[parseInt((e.changedTouches[0].pageY - this.data.searchHeight) / this.data.letterHeight)]
      })
    },

    _letterTouchMoveEvent: function (e) {
      var index = parseInt((e.changedTouches[0].pageY - this.data.searchHeight) / this.data.letterHeight)
      if (index > this.data.alphabet.length - 1) {
        index = this.data.alphabet.length - 1
      } else if (index < 0) {
        index = 0;
      }
      this.setData({
        touchLetter: this.data.alphabet[index]
      })
    },

    _letterTouchEndEvent: function (e) {
      this.setData({
        startTouchAlphabet: false,
        touchLetter: ''
      })
    },

    _letterTouchCancelEvent: function (e) {
      this.setData({
        startTouchAlphabet: false,
        touchLetter: ''
      })
    },

  }
})