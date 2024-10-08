// index.js 
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGRhdGVkX2F0IjoiMjAyNC0xMC0wOFQwNDoyNTo0NS4wMDlaIiwiYWRkcmVzcyI6eyJjb3VudHJ5IjpudWxsLCJwb3N0YWxfY29kZSI6bnVsbCwicmVnaW9uIjpudWxsLCJmb3JtYXR0ZWQiOm51bGx9LCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV9udW1iZXIiOm51bGwsImxvY2FsZSI6bnVsbCwiem9uZWluZm8iOm51bGwsImJpcnRoZGF0ZSI6bnVsbCwiZ2VuZGVyIjoiVSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJlbWFpbCI6ImNoZW5xaUBiaWdjcnVpc2UuY24iLCJ3ZWJzaXRlIjpudWxsLCJwaWN0dXJlIjoiaHR0cHM6Ly9maWxlcy5hdXRoaW5nLmNvL2F1dGhpbmctY29uc29sZS9kZWZhdWx0LXVzZXItYXZhdGFyLnBuZyIsInByb2ZpbGUiOm51bGwsInByZWZlcnJlZF91c2VybmFtZSI6bnVsbCwibmlja25hbWUiOm51bGwsIm1pZGRsZV9uYW1lIjpudWxsLCJmYW1pbHlfbmFtZSI6bnVsbCwiZ2l2ZW5fbmFtZSI6bnVsbCwibmFtZSI6bnVsbCwic3ViIjoiNjQwMDY2OGE5Zjg2NzExMGU5OGQ5NjE5IiwiZXh0ZXJuYWxfaWQiOm51bGwsInVuaW9uaWQiOm51bGwsInVzZXJuYW1lIjpudWxsLCJkYXRhIjp7InR5cGUiOiJ1c2VyIiwidXNlclBvb2xJZCI6IjYyMjgwOTk2ZWU3ZDJkMTQxNGI4NzBiMyIsImFwcElkIjoiNjIzMTUyNThhYjBhNDI1MDVhMGQ2YmI4IiwiaWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJ1c2VySWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJfaWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJwaG9uZSI6bnVsbCwiZW1haWwiOiJjaGVucWlAYmlnY3J1aXNlLmNuIiwidXNlcm5hbWUiOm51bGwsInVuaW9uaWQiOm51bGwsIm9wZW5pZCI6bnVsbCwiY2xpZW50SWQiOiI2MjI4MDk5NmVlN2QyZDE0MTRiODcwYjMifSwidXNlcnBvb2xfaWQiOiI2MjI4MDk5NmVlN2QyZDE0MTRiODcwYjMiLCJhdWQiOiI2MjMxNTI1OGFiMGE0MjUwNWEwZDZiYjgiLCJleHAiOjE3Mjk1NzQyODYsImlhdCI6MTcyODM2NDY4NiwiaXNzIjoiaHR0cHM6Ly9ob29rcy5hdXRoaW5nLmNuL29pZGMifQ.22FBc0rwk2QBvHGaWNhyolICM4HPm9wxmSTcp-_F_2U`
const recorderManager = wx.getRecorderManager();
const fs = wx.getFileSystemManager();
 
const socket = wx.connectSocket({
  url: `ws://localhost:5174/socket.io/?token=${token}`, 
  success: (res) => {
    console.log('链接websocket success', res)
  },
  fail: (err) => {
    console.error('链接websocket fail', err)
  }
})
Page({
  data: {
    isIng: false
  },
  onLoad() {
    this.initSocket()
    this.initRecorder()
  },

  onShow() {

  },
  initSocket() {
    socket.onOpen(res => {
      console.log('socket onOpen', res)
    })

    socket.onClose(res => {
      console.log('socket onClose', res)
    })

    socket.onError(err => {
      console.log('socket onError', err)
    })

    socket.onMessage((res) => {
      console.log('socket onMessage', res)
    })
  },

  initRecorder() {
    recorderManager.onStart(() => {
      console.log('recorder start')
      this.setData({
        isIng: true
      })
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
      this.setData({
        isIng: false
      })
    })
    recorderManager.onStop((res) => {
      this.setData({
        isIng: false
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
        isIng: false
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
      isIng: true
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
})