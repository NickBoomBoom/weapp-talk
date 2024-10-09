// index.js 
const WEB_SOCKET_URL = 'wss://kidtalk.tltr.top/ws/'
// const WEB_SOCKET_URL = 'ws://localhost:3000'
const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cGRhdGVkX2F0IjoiMjAyNC0xMC0wOFQwNzo0NjoxMy44MDdaIiwiYWRkcmVzcyI6eyJjb3VudHJ5IjpudWxsLCJwb3N0YWxfY29kZSI6bnVsbCwicmVnaW9uIjpudWxsLCJmb3JtYXR0ZWQiOm51bGx9LCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOmZhbHNlLCJwaG9uZV9udW1iZXIiOm51bGwsImxvY2FsZSI6bnVsbCwiem9uZWluZm8iOm51bGwsImJpcnRoZGF0ZSI6bnVsbCwiZ2VuZGVyIjoiVSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJlbWFpbCI6ImNoZW5xaUBiaWdjcnVpc2UuY24iLCJ3ZWJzaXRlIjpudWxsLCJwaWN0dXJlIjoiaHR0cHM6Ly9maWxlcy5hdXRoaW5nLmNvL2F1dGhpbmctY29uc29sZS9kZWZhdWx0LXVzZXItYXZhdGFyLnBuZyIsInByb2ZpbGUiOm51bGwsInByZWZlcnJlZF91c2VybmFtZSI6bnVsbCwibmlja25hbWUiOm51bGwsIm1pZGRsZV9uYW1lIjpudWxsLCJmYW1pbHlfbmFtZSI6bnVsbCwiZ2l2ZW5fbmFtZSI6bnVsbCwibmFtZSI6bnVsbCwic3ViIjoiNjQwMDY2OGE5Zjg2NzExMGU5OGQ5NjE5IiwiZXh0ZXJuYWxfaWQiOm51bGwsInVuaW9uaWQiOm51bGwsInVzZXJuYW1lIjpudWxsLCJkYXRhIjp7InR5cGUiOiJ1c2VyIiwidXNlclBvb2xJZCI6IjYyMjgwOTk2ZWU3ZDJkMTQxNGI4NzBiMyIsImFwcElkIjoiNjIzMTUyNThhYjBhNDI1MDVhMGQ2YmI4IiwiaWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJ1c2VySWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJfaWQiOiI2NDAwNjY4YTlmODY3MTEwZTk4ZDk2MTkiLCJwaG9uZSI6bnVsbCwiZW1haWwiOiJjaGVucWlAYmlnY3J1aXNlLmNuIiwidXNlcm5hbWUiOm51bGwsInVuaW9uaWQiOm51bGwsIm9wZW5pZCI6bnVsbCwiY2xpZW50SWQiOiI2MjI4MDk5NmVlN2QyZDE0MTRiODcwYjMifSwidXNlcnBvb2xfaWQiOiI2MjI4MDk5NmVlN2QyZDE0MTRiODcwYjMiLCJhdWQiOiI2MjMxNTI1OGFiMGE0MjUwNWEwZDZiYjgiLCJleHAiOjE3Mjk1ODMyMzgsImlhdCI6MTcyODM3MzYzOCwiaXNzIjoiaHR0cHM6Ly9ob29rcy5hdXRoaW5nLmNuL29pZGMifQ.kySdvF3C4erhyRILgaBiGAp00agjT4IEMm5S0eASrgs`
const recorderManager = wx.getRecorderManager();
const fs = wx.getFileSystemManager();
const innerAudioContext = wx.createInnerAudioContext();

Page({
  socket: wx.connectSocket({
    url: WEB_SOCKET_URL,
  }),
  data: {
    isInputIng: false,
    isReplying: false,
    list: [],
    info: {},
    scrollTop: 0,
    isPlaying: false

  },
  onLoad() {
    this.initSocket()
    this.initRecorder()
    this.initAudio()
  },
  onUnload() {
    this.socket.close()
  },

  initAudio() {
    innerAudioContext.onPlay(() => {
      this.setData({
        isPlaying: true
      })
    })
    innerAudioContext.onEnded(() => {
      this.setData({
        isPlaying: false
      })
    })
  },
  initSocket() {
    this.socket.onOpen(() => {
      console.log('socket onOpen')
      this.reset()
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
      data.content = data.content.replaceAll('\n', '<br/>')

      if (command === 'init') {
        wx.hideLoading()
        this.setData({
          info: data,
          list: [...list, {
            type: 'left',
            key: list.length,
            ...data
          }]
        })
      } else if (command === 'chat') {
        data.originContent = data.originContent.replaceAll('\n', '<br/>')
        const {
          audio,
          content,
          originContent,
        } = data

        this.setData({
          isReplying: false,
          list: [...list, {
            content: originContent,
            key: list.length,
            type: "right"
          }, {
            content,
            audio,
            key: list.length + 1,
            type: 'left'
          }]
        }, this.scrollBottom)
      }

      if (data.audio) {
        this.playAudio(data.audio)
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
      const {
        info
      } = this.data
      fs.readFile({
        filePath: res.tempFilePath,
        encoding: 'base64',
        success: (result) => {

          this.setData({
            isReplying: true
          }, this.scrollBottom)

          this.socket.send({
            data: JSON.stringify({
              event: "chat",
              data: {
                token,
                content: result.data,
                sessionId: info.sessionId
              }
            }),
            success: res => {
              console.log('send chat', res)
            },
            fail: err => console.error('send chat fail', err)
          })
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
    const {
      isReplying
    } = this.data
    if (isReplying) {
      return console.warn('正在回复中...')
    }

    innerAudioContext.stop()
    this.setData({
      isInputIng: true,
      isPlaying: false
    })
    const options = {
      duration: 600000, // 最大值 600000 (10分钟)
      sampleRate: 44100, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 192000, // 编码码率
      format: 'wav',
      frameSize: 50, //	指定帧大小，单位 KB。传入 frameSize 后，每录制指定帧大小的内容后，会回调录制的文件内容，不指定则不会回调。暂仅支持 mp3、pcm 格式。
    }
    recorderManager.start(options)
  },
  handleStop() {
    recorderManager.stop()
  },
  reset() {
    wx.showLoading({
      title: '连接中...',
    })
    innerAudioContext.stop()
    this.setData({
      info: {},
      list: []
    })
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
  },

  scrollBottom() {
    const query = wx.createSelectorQuery();
    query.select('.index-scroll-inner').boundingClientRect(rect => {
      this.setData({
        scrollTop: rect.height
      });
    }).exec();
  },

  handlePlayAudio(e) {
    const {
      isPlaying
    } = this.data
    if (isPlaying) {
      wx.showToast({
        title: '有音频正在播放,请等待播放完毕再点击',
        icon: 'none'
      })
      return
    }
    this.playAudio(e.currentTarget.dataset.item.audio)
  },

  playAudio(file) {
    innerAudioContext.src = file
    innerAudioContext.play();
  }
})