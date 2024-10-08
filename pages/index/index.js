// index.js 
const WEB_SOCKET_URL = 'ws://localhost:3000'
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGRhdGVkX2F0IjoiMjAyNC0xMC0wOFQwNzo0NjoxMy44MDdaIiwiYWRkcmVzcyI6eyJjb3VudHJ5IjpudWxsLCJwb3N0YWxfY29kZSI6bnVsbCwicmVnaW9uIjpudWxsLCJmb3JtYXR0ZWQiOm51bGx9LCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV9udW1iZXIiOm51bGwsImxvY2FsZSI6bnVsbCwiem9uZWluZm8iOm51bGwsImJpcnRoZGF0ZSI6bnVsbCwiZ2VuZGVyIjoiVSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJlbWFpbCI6ImNoZW5xaUBiaWdjcnVpc2UuY24iLCJ3ZWJzaXRlIjpudWxsLCJwaWN0dXJlIjoiaHR0cHM6Ly9maWxlcy5hdXRoaW5nLmNvL2F1dGhpbmctY29uc29sZS9kZWZhdWx0LXVzZXItYXZhdGFyLnBuZyIsInByb2ZpbGUiOm51bGwsInByZWZlcnJlZF91c2VybmFtZSI6bnVsbCwibmlja25hbWUiOm51bGwsIm1pZGRsZV9uYW1lIjpudWxsLCJmYW1pbHlfbmFtZSI6bnVsbCwiZ2l2ZW5fbmFtZSI6bnVsbCwibmFtZSI6bnVsbCwic3ViIjoiNjQwMDY2OGE5Zjg2NzExMGU5OGQ5NjE5IiwiZXh0ZXJuYWxfaWQiOm51bGwsInVuaW9uaWQiOm51bGwsInVzZXJuYW1lIjpudWxsLCJkYXRhIjp7InR5cGUiOiJ1c2VyIiwidXNlclBvb2xJZCI6IjYyMjgwOTk2ZWU3ZDJkMTQxNGI4NzBiMyIsImFwcElkIjoiNjIzMTUyNThhYjBhNDI1MDVhMGQ2YmI4IiwiaWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJ1c2VySWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJfaWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJwaG9uZSI6bnVsbCwiZW1haWwiOiJjaGVucWlAYmlnY3J1aXNlLmNuIiwidXNlcm5hbWUiOm51bGwsInVuaW9uaWQiOm51bGwsIm9wZW5pZCI6bnVsbCwiY2xpZW50SWQiOiI2MjI4MDk5NmVlN2QyZDE0MTRiODcwYjMifSwidXNlcnBvb2xfaWQiOiI2MjI4MDk5NmVlN2QyZDE0MTRiODcwYjMiLCJhdWQiOiI2MjMxNTI1OGFiMGE0MjUwNWEwZDZiYjgiLCJleHAiOjE3Mjk1ODMyMzgsImlhdCI6MTcyODM3MzYzOCwiaXNzIjoiaHR0cHM6Ly9ob29rcy5hdXRoaW5nLmNuL29pZGMifQ.kySdvF3C4erhyRILgaBiGAp00agjT4IEMm5S0eASrgs`
const recorderManager = wx.getRecorderManager();
const fs = wx.getFileSystemManager();


Page({
  socket: wx.connectSocket({
    url: WEB_SOCKET_URL,
  }),
  data: {
    isInputIng: false,
    list: [],
  },
  onLoad() {
    wx.showLoading({
      title: '连接中...',

    })
    this.initSocket()
    this.initRecorder()
  },
  onUnload() {
    this.socket.close()
  },

  initSocket() {
    console.log(5555, this.socket)
    this.socket.onOpen(() => {
      console.log('socket onOpen')
      this.socket.send({
        data: JSON.stringify({
          event: "init",
          data: {
            token
          }
        }),
        success: res => {
          console.log('send init', res)
        },
        fail: err => console.error('send init fail', err)
      })
    })

    this.socket.onMessage((res) => {
      const data = JSON.parse(res.data)
      console.log('socket onMessage', data)
      const {
        command
      } = data
      const {
        list
      } = this.data
      this.setData({
        list: [...list, data]
      })
      if (command === 'init') {
        wx.hideLoading()
      } else if (command === 'chat') {
        console.log(333)
      }
    })

    this.socket.onClose(() => {
      console.log('socket onClose')
    })

    this.socket.onError(err => {
      console.log('socket onError', err)
    })


  },

  initRecorder() {
    recorderManager.onStart(() => {
      console.log('recorder start')
      this.setData({
        isInputIng: true
      })
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
      this.setData({
        isInputIng: false
      })
    })
    recorderManager.onStop((res) => {
      this.setData({
        isInputIng: false
      })
      console.log('recorder stop', res)
      fs.readFile({
        filePath: res.tempFilePath,
        encoding: 'base64',
        success(result) {
          console.log(3333, result.data)
        }
      })
    })
    recorderManager.onError((res) => {
      console.log('recorder error', res)
      wx.showToast({
        title: res.errMsg,
        icon: 'none'
      })
      this.setData({
        isInputIng: false
      })
    })
    recorderManager.onFrameRecorded((res) => {
      const {
        frameBuffer
      } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
    })
    recorderManager.onInterruptionBegin(() => {
      recorderManager.stop()
    })
    recorderManager.onInterruptionEnd(() => {
      recorderManager.stop()
    })
  },
  handleStart() {
    this.setData({
      isInputIng: true
    })
    const options = {
      duration: 600000, // 最大值 600000 (10分钟)
      sampleRate: 44100, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 192000, // 编码码率
      format: 'mp3',
      frameSize: 50, //	指定帧大小，单位 KB。传入 frameSize 后，每录制指定帧大小的内容后，会回调录制的文件内容，不指定则不会回调。暂仅支持 mp3、pcm 格式。
    }
    recorderManager.start(options)
  },
  handleStop() {
    recorderManager.stop()
  },
  reset() {

  }
})