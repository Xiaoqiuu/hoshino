//由于macOS和windows系统注册自定义协议的参数不同所以创建一个函数处理注册
function setDefaultProtocol(scheme) {
    if(process.platform === 'win32') {
      let args = []
      if(!app.isPackaged) {
        args.push(path.resolve(process.argv[1]))
      }
      args.push('--')
      if(!app.isDefaultProtocolClient(scheme,process.execPath, args)) {
        app.setAsDefaultProtocolClient(scheme,process.execPath, args)
      }
    }
    else {
      if(!app.isDefaultProtocolClient(scheme)) {
        app.setAsDefaultProtocolClient(scheme)
      }
    }
}

setDefaultProtocol('st')

const isSingleLockApp = app.requestSingleInstanceLock()
  if(!isSingleLockApp) {
    app.quit()
  }
  
app.on('second-instance',(event,argv) => {
    if (process.platform === 'win32') {
      handleArgv(argv);
    }})

app.on('open-url', (event, url) => {
    handleURL(url)
  })
  
  function handleURL(url) {
      //对于自定义协议的处理和使用
  }