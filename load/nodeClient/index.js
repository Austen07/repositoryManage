//fetch the performance data of local machines and and send it to server

const os = require('os');
const io = require('socket.io-client');
let socket = io("http://127.0.0.1:8181");

socket.on("connect", () => {
  // console.log("Connected to the socketIO server");

  //need to identify this machine
  //don't use IP address because ip may be the same
  //use unique mac address
  const nI = os.networkInterfaces();
  let macAddress;
  //loop through all the nI for this machine and find a non-internal one
  //to find a valid mac Address
  for(let key in nI) {
    /***********
    Just for test, comment it out in real working
    make every machine joined is assigned a random number 1,2,3
    */
    macAddress = Math.floor(Math.random() * 3) + 1;
    break;
    /***********/


    if(!nI[key][0].internal){
        macAddress = nI[key][0].mac;
      break;
    }
  };

  socket.emit('clientAuth', "nodeClient");
  
  //get initial data
  performanceData().then((allPerformanceData) => {
    allPerformanceData.macA = macAddress;
    socket.emit("initPerfData", allPerformanceData);
  });

  //start sending data on interval
  let perDataInterval = setInterval(() => {
    performanceData().then((allPerformanceData) => {
      // console.log(allPerformanceData);
      allPerformanceData.macA = macAddress;
      socket.emit("perfData", allPerformanceData);
    });    
  }, 1000);

  socket.on("disconnect", () => {
    clearInterval(perDataInterval);
  });
});


//return an object
const performanceData = () => {
  return new Promise(async (resolve, reject) => {
    const cpus = os.cpus();
    // about performance :

    // - Memory Usuage:
    // 1)free
    const freeMem = os.freemem();
    // 2)total
    const totalMem = os.totalmem();

    const usedMem = totalMem - freeMem;
    const memUseage = Math.floor(usedMem / totalMem * 100) / 100;//to keep last two decimals

    // - OS type
    const osType = os.type() == 'Darwin' ? 'Mac' : os.type();
    // console.log(osType);

    // - uptime
    const upTime = os.uptime();
    // console.log(uptime);

    // - CPU info (type, number ,clock speed)
    const cpuModel = cpus[0].model;
    const cpuSpeed = cpus[0].speed;
    const numCores = cpus.length;

    // - CPU load
    const cpuLoad = await getCpuLoad();

    // status offline or online
    const isActive = true;

    resolve({
      freeMem,
      totalMem,
      usedMem,
      memUseage,
      osType,
      upTime,
      cpuModel,
      numCores,
      cpuSpeed,
      cpuLoad,
      isActive
    })
  });
};
 

/*** FUNCTIONS ***/

// cpus is all cores, so need the average of all the cores which will give the cpu average
const cpuAverage = () => {
  const cpus = os.cpus();
  let idleMs = 0;
  let totalMs = 0;

  cpus.forEach((core) => {
    for(type in core.times){
      totalMs += core.times[type];
    }

    idleMs += core.times.idle;
  });
  
  return {
    idle: idleMs / cpus.length,
    total: totalMs / cpus.length
  }
}

//because time property is the time since boot
//get the current time and 100ms from current time. 
//Minus them and get the current load
const getCpuLoad = () => {
  return new Promise((resolve, reject) => {
    const start = cpuAverage();

    setTimeout(() => {
      const end = cpuAverage();
      const idleDifference = end.idle - start.idle;
      const totalDifference = end.total - start.total;

      const percentageCpu = 100 - Math.floor(100 * idleDifference / totalDifference);
      resolve(percentageCpu);
    }, 100);
  });
};

