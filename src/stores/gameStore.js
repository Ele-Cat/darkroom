import { defineStore } from 'pinia'
import defaultSettings from '@/config/defaultSettings'
import eventBus from '@/utils/eventBus'
import audioPlayer from '@/utils/audioPlayer'

export const useGameStore = defineStore('game', {
  state: () => ({
    // 物资资源
    stores: {
      wood: 0, // 木材数量
      meat: 0, // 生肉数量
      fur: 0, // 毛皮数量
      bacon: 0, // 熏肉数量
      leather: 0 // 皮革数量
    },
    // 火堆状态名称
    fireLevelNames: ['熄灭', '火光微弱', '轻轻闪烁', '燃烧着', '熊熊燃烧'],
    // 火堆状态对应的音效
    fireLevelSounds: [
      'MUSIC_FIRE_DEAD',       // 熄灭
      'MUSIC_FIRE_SMOLDERING',  // 闷烧
      'MUSIC_FIRE_FLICKERING',  // 闪烁
      'MUSIC_FIRE_BURNING',     // 燃烧
      'MUSIC_FIRE_ROARING'      // 咆哮
    ],
    darkMode: true, // 是否为暗色模式
    population: 0, // 人口数量
    populationTimer: null, // 人口到达定时器
    // 建筑解锁状态
    buildings: {
      fire: 0, // 火堆状态：0-熄灭，1-闷烧，2-闪烁，3-燃烧，4-咆哮
      fireTimer: 0, // 火堆定时器，用于追踪上次添柴的时间
      village: -1, // 村落等级
      cart: 0, // 货车是否解锁（0-未解锁，1-已解锁）
      huntingCabin: 0, // 狩猎小屋是否解锁
      smokehouseCabin: 0, // 熏肉小屋是否解锁
      tanneryCabin: 0, // 制革小屋是否解锁
      tradingPost: 0, // 贸易站是否解锁
      workshop: 0, // 工坊是否解锁
      traps: 0, // 陷阱数量
    },
    jobs: {
      lumberjack: 0, // 伐木工人数
      hunter: 0, // 猎人人数
      butcher: 0, // 熏肉师人数
      smoker: 0, // 熏肉师人数
      tanner: 0 // 皮革师人数
    },
    cooldowns: {
      wood: 0, // 木材冷却时间
      trap: 0 // 陷阱冷却时间
    },
    // 资源增加计数器（每100次触发一次，即10秒）
    resourceTimerCounter: 0,
    // 天灾系统
    disasterSystem: {
      timer: 0, // 天灾计时器
      nextDisasterTime: Math.floor(Math.random() * (defaultSettings.disaster.cd.max - defaultSettings.disaster.cd.min + 1)) + defaultSettings.disaster.cd.min, // 下次天灾时间（分钟）
      disasterActive: false // 标记是否有天灾正在显示
    },
    logs: [], // 日志列表
    // 日志队列，用于延迟显示
    logQueue: [],
    // 日志队列处理定时器
    logQueueTimer: null,
    // 日志延迟时间（毫秒）
    logDelayTime: 500
  }),
  getters: {
    canUnlockVillage: (state) => {
      return state.stores.wood >= defaultSettings.village.unlockWoodCost
    },
    canShowExploreTab: (state) => {
      return state.buildings.village >= 10 && false
    },
    maxPopulation: (state) => {
      return state.buildings.village * defaultSettings.building.cabin.maxPopulationPerCabin
    },
    // 物料buff效果
    materialBuffs: (state) => {
      const buffs = {
        wood: 0,
        meat: 0,
        fur: 0,
        bacon: 0,
        leather: 0
      }
      
      // 货车buff
      if (state.buildings.cart) {
        buffs.wood += defaultSettings.buffs.cart.wood
      }
      
      // 工作模块buff
      if (state.population) {
        // 伐木工buff
        if (state.jobs.lumberjack > 0) {
          const lumberjackBuff = defaultSettings.jobs.types.find(job => job.id === 'lumberjack')
          if (lumberjackBuff) {
            let efficiencyMultiplier = 1
            buffs.wood += state.jobs.lumberjack * lumberjackBuff.wood * efficiencyMultiplier
          }
        }
        // 猎人buff
        if (state.jobs.hunter > 0 && state.buildings.huntingCabin) {
          const hunterBuff = defaultSettings.jobs.types.find(job => job.id === 'hunter')
          if (hunterBuff) {
            buffs.meat += state.jobs.hunter * hunterBuff.meat
            buffs.fur += state.jobs.hunter * hunterBuff.fur
          }
        }
        // 熏肉师buff
        if (state.jobs.butcher > 0 && state.buildings.huntingCabin) {
          const butcherBuff = defaultSettings.jobs.types.find(job => job.id === 'butcher')
          if (butcherBuff) {
            buffs.bacon += state.jobs.butcher * butcherBuff.bacon
            buffs.wood -= state.jobs.butcher * butcherBuff.consume_wood
            buffs.meat -= state.jobs.butcher * butcherBuff.consume_meat
          }
        }
        // 皮革师buff
        if (state.jobs.tanner > 0 && state.buildings.tanneryCabin) {
          const tannerBuff = defaultSettings.jobs.types.find(job => job.id === 'tanner')
          if (tannerBuff) {
            buffs.leather += state.jobs.tanner * tannerBuff.leather
            buffs.fur -= state.jobs.tanner * tannerBuff.consume_fur
          }
        }
      }
      
      return buffs
    },
    // 物料净变化量
    materialNetChanges: (state, getters) => {
      const buffs = getters.materialBuffs
      return {
        wood: buffs.wood,
        meat: buffs.meat,
        fur: buffs.fur,
        bacon: buffs.bacon,
        leather: buffs.leather
      }
    },
    // 闲散人员数量
    idlePopulation: (state) => {
      const totalJobs = Object.values(state.jobs).reduce((sum, count) => sum + count, 0)
      return Math.max(0, state.population - totalJobs)
    },
    // 所有工种的总人数
    totalJobs: (state) => {
      return Object.values(state.jobs).reduce((sum, count) => sum + count, 0)
    },
  },
  actions: {
    getVillageName() {
      const level = this.buildings.village
      if (level >= 26) {
        return '喧嚣城镇'
      } else if (level >= 20) {
        return '小型城镇'
      } else if (level >= 14) {
        return '大型村落'
      } else if (level >= 8) {
        return '中型村落'
      } else if (level >= 2) {
        return '小型村落'
      } else {
        return '村落'
      }
    },
    collectWood() {
      if (this.cooldowns.wood <= 0) {
        let woodAmount = defaultSettings.collection.wood.amount
        if (this.buildings.cart) {
          woodAmount += 10
        }
        this.stores.wood += woodAmount
        this.addLog(`你收集了${woodAmount}块木材`)
        this.cooldowns.wood = defaultSettings.collection.wood.cooldown
        this.saveGameState()
      }
    },
    checkFireLevel(typeName) {
      // 检查火堆是否熄灭
      if (this.buildings.fire === 0) {
        this.addLog('小屋火堆已经熄灭了，你无法进行' + typeName + '。赶紧重新点燃火堆吧！', 2)
        return false
      }
      return true
    },
    lightFire() {
      // 检查木材是否足够
      if (this.stores.wood < 1) {
        this.addLog(this.buildings.fire === 0 ? '木材不够，没法生火取暖' : '木材不够，没法让火烧得更旺', 2)
        return
      }
      
      // 消耗木材
      this.stores.wood -= 1
      // 重置火堆定时器
      this.buildings.fireTimer = 0
      
      // 处理火堆状态变化
      if (this.buildings.fire === 0) {
        // 点燃火堆
        this.buildings.fire = 1 // 点燃后直接到闷烧状态
        this.addLog('微弱的火焰开始跳动，散发着温暖', 1)
      } else if (this.buildings.fire < 4) {
        // 升级火堆状态
        this.buildings.fire += 1
        this.addLog(`火焰${this.fireLevelNames[this.buildings.fire]}`)
      } else {
        // 火堆已达到最高状态
        this.addLog('火堆熊熊燃烧，房间很热')
      }
      
      // 播放对应状态的音效
      // audioPlayer.play(this.fireLevelSounds[this.fireLevel], true)
      // 保存游戏状态
      this.saveGameState()
    },
    unlockVillage() {
      const unlockWoodCost = defaultSettings.village.unlockWoodCost
      if (this.stores.wood >= unlockWoodCost) {
        this.stores.wood -= unlockWoodCost
        this.buildings.village = 0
        this.addLog(`你解锁了村落，现在可以返回小屋管理它`, 1)
        this.saveGameState()
      } else {
        this.addLog(`资源不足，需要${unlockWoodCost}木材才能解锁村落`, 2)
      }
    },
    buildStructure() {
      // 检查火堆是否熄灭
      if (!this.checkFireLevel('搭建建筑')) return
      
      // 检查村落等级是否已达到上限
      if (this.buildings.village >= 30) {
        this.addLog('村落已达到最大容量', 2)
        return
      }
      
      // 使用配置项计算资源消耗
      const baseWoodCost = defaultSettings.building.cabin.baseWoodCost
      const woodCostIncreasePerLevel = defaultSettings.building.cabin.woodCostIncreasePerLevel
      const woodCost = baseWoodCost + Math.floor(this.buildings.village * woodCostIncreasePerLevel)
      
      if (this.stores.wood >= woodCost) {
        this.stores.wood -= woodCost
        this.buildings.village += 1
        this.addLog('你建造了居住小屋', 1)
        if (this.buildings.village === 1) {
          this.addLog(`消息不胫而走，将会有居民入住你的村落`, 1)
        }
        this.saveGameState()
        // 启动人口到达定时器
        this.startPopulationArrival()
      } else {
        this.addLog('资源不足，无法建造建筑', 2)
      }
    },
    
    // 部署陷阱
    deployTrap() {
      if (!this.checkFireLevel('搭建陷阱')) return
      
      const maxTraps = defaultSettings.building.trap.maxTraps
      if (this.buildings.traps >= maxTraps) {
        this.addLog(`陷阱已达到最大数量${maxTraps}个，无法再部署`, 2)
        return
      }
      
      // 计算部署陷阱的成本
      const initialWoodCost = defaultSettings.building.trap.initialWoodCost
      const woodCostIncrease = defaultSettings.building.trap.woodCostIncrease
      
      const woodCost = initialWoodCost + this.buildings.traps * woodCostIncrease
      
      if (this.stores.wood >= woodCost) {
        this.stores.wood -= woodCost
        this.buildings.traps += 1
        this.addLog('陷阱越多，抓到的猎物就越多')
        if (this.buildings.traps === maxTraps) {
          this.addLog('陷阱已达到最大数量', 2)
        }
        this.saveGameState()
      } else {
        this.addLog(`资源不足，需要${woodCost}木材才能部署陷阱`, 2)
      }
    },
    
    // 解锁货车
    unlockCart() {
      // 检查火堆是否熄灭
      if (!this.checkFireLevel('解锁操作')) return
      
      const woodCost = defaultSettings.building.cart.woodCost
      if (!this.buildings.cart && this.stores.wood >= woodCost) {
        this.stores.wood -= woodCost
        this.buildings.cart = 1
        this.addLog('货车已解锁，收集效率更高', 1)
        this.saveGameState()
      } else if (this.buildings.cart) {
        this.addLog('货车已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁货车', 2)
      }
    },
    
    // 解锁狩猎小屋
    unlockHuntingCabin() {
      // 检查火堆是否熄灭
      if (!this.checkFireLevel('解锁操作')) return
      
      const woodCost = defaultSettings.hunting.cabin.woodCost
      const furCost = defaultSettings.hunting.cabin.furCost
      const meatCost = defaultSettings.hunting.cabin.meatCost
      if (!this.buildings.huntingCabin && this.stores.wood >= woodCost && this.stores.fur >= furCost && this.stores.meat >= meatCost) {
        this.stores.wood -= woodCost
        this.stores.fur -= furCost
        this.stores.meat -= meatCost
        this.buildings.huntingCabin = 1
        this.addLog('你解锁了狩猎小屋，新增了猎人工作', 1)
        this.saveGameState()
      } else if (this.buildings.huntingCabin) {
        this.addLog('狩猎小屋已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁狩猎小屋', 2)
      }
    },
    
    // 解锁熏肉小屋
    unlockSmokehouseCabin() {
      // 检查火堆是否熄灭
      if (!this.checkFireLevel('解锁操作')) return
      
      const woodCost = defaultSettings.smokehouse.cabin.woodCost
      const meatCost = defaultSettings.smokehouse.cabin.meatCost
      if (!this.buildings.smokehouseCabin && this.stores.wood >= woodCost && this.stores.meat >= meatCost) {
        this.stores.wood -= woodCost
        this.stores.meat -= meatCost
        this.buildings.smokehouseCabin = 1
        this.addLog('你解锁了熏肉小屋，新增了熏肉师工作', 1)
        this.saveGameState()
      } else if (this.buildings.smokehouseCabin) {
        this.addLog('熏肉小屋已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁熏肉小屋', 2)
      }
    },
    
    // 解锁制革小屋
    unlockTanneryCabin() {
      // 检查火堆是否熄灭
      if (!this.checkFireLevel('解锁操作')) return
      
      const woodCost = defaultSettings.tannery.cabin.woodCost
      const furCost = defaultSettings.tannery.cabin.furCost
      if (!this.buildings.tanneryCabin && this.stores.wood >= woodCost && this.stores.fur >= furCost) {
        this.stores.wood -= woodCost
        this.stores.fur -= furCost
        this.buildings.tanneryCabin = 1
        this.addLog('你解锁了制革小屋，新增了皮革师工作', 1)
        this.saveGameState()
      } else if (this.buildings.tanneryCabin) {
        this.addLog('制革小屋已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁制革小屋', 2)
      }
    },
    
    // 解锁贸易站
    unlockTradingPost() {
      // 检查火堆是否熄灭
      if (!this.checkFireLevel('解锁操作')) return
      
      const woodCost = defaultSettings.tradingPost.cabin.woodCost
      const baconCost = defaultSettings.tradingPost.cabin.baconCost
      const leatherCost = defaultSettings.tradingPost.cabin.leatherCost
      if (!this.buildings.tradingPost && this.stores.wood >= woodCost && this.stores.bacon >= baconCost && this.stores.leather >= leatherCost) {
        this.stores.wood -= woodCost
        this.stores.bacon -= baconCost
        this.stores.leather -= leatherCost
        this.buildings.tradingPost = 1
        this.addLog('你解锁了贸易站，可以购买物品', 1)
        this.saveGameState()
      } else if (this.buildings.tradingPost) {
        this.addLog('贸易站已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁贸易站', 2)
      }
    },
    
    // 解锁工坊
    unlockWorkshop() {
      // 检查火堆是否熄灭
      if (!this.checkFireLevel('解锁操作')) return
      
      const woodCost = defaultSettings.workshop.cabin.woodCost
      const meatCost = defaultSettings.workshop.cabin.meatCost
      const furCost = defaultSettings.workshop.cabin.furCost
      if (!this.buildings.workshop && this.stores.wood >= woodCost && this.stores.meat >= meatCost && this.stores.fur >= furCost) {
        this.stores.wood -= woodCost
        this.stores.meat -= meatCost
        this.stores.fur -= furCost
        this.buildings.workshop = 1
        this.addLog('你解锁了工坊建筑', 1)
        this.saveGameState()
      } else if (this.buildings.workshop) {
        this.addLog('工坊已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁工坊', 2)
      }
    },
    
    // 货车自动增加资源
    increaseResourcesByCart() {
      if (this.buildings.cart) {
        const woodIncrease = defaultSettings.buffs.cart.wood
        this.stores.wood += woodIncrease
        this.saveGameState()
      }
    },
    
    // 工作模块自动增加资源
    increaseResourcesByJobs() {
      if (this.population) {
        // 伐木工增加木材
        if (this.jobs.lumberjack > 0) {
          const lumberjackBuff = defaultSettings.jobs.types.find(job => job.id === 'lumberjack')
          if (lumberjackBuff) {
            // 计算效率乘数，考虑石斧的影响
            let efficiencyMultiplier = 1
            const woodIncrease = this.jobs.lumberjack * lumberjackBuff.wood * efficiencyMultiplier
            this.stores.wood += woodIncrease
          }
        }
        // 猎人增加生肉和毛皮
        if (this.jobs.hunter > 0 && this.buildings.huntingCabin) {
          const hunterBuff = defaultSettings.jobs.types.find(job => job.id === 'hunter')
          if (hunterBuff) {
            const meatIncrease = this.jobs.hunter * hunterBuff.meat
            const furIncrease = this.jobs.hunter * hunterBuff.fur
            this.stores.meat += meatIncrease
            this.stores.fur += furIncrease
          }
        }
        // 熏肉师生产熏肉（消耗生肉和木材）
        if (this.jobs.butcher > 0 && this.buildings.smokehouseCabin) {
          const butcherBuff = defaultSettings.jobs.types.find(job => job.id === 'butcher')
          if (butcherBuff) {
            // 检查是否有足够的资源
            const requiredMeat = this.jobs.butcher * butcherBuff.consume_meat
            const requiredWood = this.jobs.butcher * butcherBuff.consume_wood
            
            if (this.stores.meat >= requiredMeat && this.stores.wood >= requiredWood) {
              const baconIncrease = this.jobs.butcher * butcherBuff.bacon
              this.stores.bacon += baconIncrease
              this.stores.meat -= requiredMeat
              this.stores.wood -= requiredWood
            }
          }
        }
        // 皮革师生产皮革（消耗毛皮）
        if (this.jobs.tanner > 0 && this.buildings.tanneryCabin) {
          const tannerBuff = defaultSettings.jobs.types.find(job => job.id === 'tanner')
          if (tannerBuff) {
            // 检查是否有足够的资源
            const requiredFur = this.jobs.tanner * tannerBuff.consume_fur
            
            if (this.stores.fur >= requiredFur) {
              const leatherIncrease = this.jobs.tanner * tannerBuff.leather
              this.stores.leather += leatherIncrease
              this.stores.fur -= requiredFur
            }
          }
        }
        this.saveGameState()
      }
    },
    
    // 调整工种人数
    adjustJobCount(jobId, change) {
      // 不允许直接调整伐木工人数
      if (jobId === 'lumberjack') {
        return
      }
      
      // 确保jobs对象中存在对应的属性
      if (!this.jobs.hasOwnProperty(jobId)) {
        this.jobs[jobId] = 0
      }
      
      // 计算除当前工种和伐木工外的其他工种总人数
      const otherJobsTotal = Object.entries(this.jobs).reduce((sum, [key, count]) => {
        return (key !== jobId && key !== 'lumberjack') ? sum + count : sum
      }, 0)
      
      // 计算调整后的目标工种人数
      let newJobCount
      if (change > 0) {
        // 增加人数：不能超过总人口减去其他工种的人数
        const maxJobCount = this.population - otherJobsTotal
        newJobCount = Math.min(this.jobs[jobId] + change, maxJobCount)
      } else {
        // 减少人数：至少为0
        newJobCount = Math.max(0, this.jobs[jobId] + change)
      }
      
      // 计算人数变化量
      const jobChange = newJobCount - this.jobs[jobId]
      
      // 确保人数变化量有效
      if (jobChange === 0) {
        return
      }
      
      // 更新目标工种人数
      this.jobs[jobId] = newJobCount
      
      // 自动调整伐木工人数，确保总工作人数等于总人口
      this.jobs.lumberjack = Math.max(0, this.population - otherJobsTotal - this.jobs[jobId])
      
      this.saveGameState()
    },
    
    // 启动人口到达定时器
    startPopulationArrival() {
      // 如果已经有定时器，先清除
      if (this.populationTimer) {
        clearTimeout(this.populationTimer)
      }
      
      // 计算随机到达时间（10-30秒）
      const arrivalTime = Math.floor(Math.random() * (defaultSettings.population.arrivalTimeMax - defaultSettings.population.arrivalTimeMin + 1)) + defaultSettings.population.arrivalTimeMin
      
      // 设置定时器
      this.populationTimer = setTimeout(() => {
        this.handlePopulationArrival()
      }, arrivalTime * 1000)
    },
    
    // 获取随机到达场景描述
    getArrivalScene() {
      const scenes = [
        '风雨飘摇的夜晚',
        '寒冷的冬日清晨',
        '阳光明媚的午后',
        '雾气弥漫的黄昏',
        '星空璀璨的深夜',
        '雨过天晴的早晨',
        '暴风雪肆虐的夜晚',
        '月光皎洁的午夜',
        '雷声轰鸣的傍晚',
        '清风徐徐的黄昏'
      ]
      const randomIndex = Math.floor(Math.random() * scenes.length)
      return scenes[randomIndex]
    },

    // 处理人口到达
    handlePopulationArrival() {
      // 计算随机到达人数（1-3人）
      const arrivalCount = Math.floor(Math.random() * (defaultSettings.population.arrivalCountMax - defaultSettings.population.arrivalCountMin + 1)) + defaultSettings.population.arrivalCountMin
      
      // 计算最大可增加的人口数量
      const maxPossiblePopulation = this.buildings.village * defaultSettings.building.cabin.maxPopulationPerCabin
      const availableSlots = maxPossiblePopulation - this.population
      const actualArrivalCount = Math.min(arrivalCount, availableSlots)
      
      if (actualArrivalCount > 0) {
        // 解锁工作模块
        if (this.population == 0) {
          this.addLog('工作模块已解锁，你可以在村落中为村民分配工作了', 1)
          
          // 触发新村民到来事件，用于App组件切换tab
          eventBus.emit('newVillagersArrived')
        }

        this.population += actualArrivalCount
        // 默认将新村民添加为伐木工
        this.jobs.lumberjack = (this.jobs.lumberjack || 0) + actualArrivalCount
        const scene = this.getArrivalScene()
        this.addLog(`${scene}，有${actualArrivalCount}人来到了你的村落`, 1)
        
        this.saveGameState()
      }
      
      // 如果还有空槽位，继续启动定时器
      if (this.population < maxPossiblePopulation) {
        this.startPopulationArrival()
      }
    },
    // 查看陷阱按钮
    checkTraps() {
      if (!this.checkFireLevel('收集操作')) return
      
      if (this.cooldowns.trap > 0) return
      
      if (this.buildings.traps <= 0) {
        this.addLog('你还没有部署任何陷阱', 2)
        return
      }
      
      // 设置冷却时间
      this.cooldowns.trap = defaultSettings.building.trap.checkCooldown
      
      // 计算获得的资源数量（每个陷阱单独随机获得）
      let totalMeatAmount = 0
      let totalFurAmount = 0
      
      for (let i = 0; i < this.buildings.traps; i++) {
        totalMeatAmount += Math.floor(Math.random() * 3) // 每个陷阱获得0-2个生肉
        totalFurAmount += Math.floor(Math.random() * 3) // 每个陷阱获得0-2个毛皮
      }
      
      // 增加资源
      this.stores.meat += totalMeatAmount
      this.stores.fur += totalFurAmount
      this.addLog(`查看陷阱，你获得了生肉 ${totalMeatAmount}，毛皮 ${totalFurAmount}`)
      
      // 20%的几率破坏一个陷阱
      if (Math.random() < 0.2) {
        this.buildings.traps -= 1
        this.addLog('一个陷阱被破坏了', 2)
      }
      
      this.saveGameState()
    },
    huntAnimals() {
      this.addLog('你开始狩猎动物')
    },
    gatherBerries() {
      this.addLog('你采集了一些浆果')
    },
    addLog(message, type = 0) {
      // 创建日志对象
      const log = {
        id: Date.now() + Math.random().toString(36).substring(2),
        message: message,
        type: type
      }
      
      // 将日志添加到队列
      this.logQueue.push(log)
      
      // 如果没有正在处理的定时器，启动处理
      if (!this.logQueueTimer) {
        this.processLogQueue()
      }
    },
    
    // 处理日志队列
    processLogQueue() {
      if (this.logQueue.length === 0) {
        // 队列为空，清除定时器
        if (this.logQueueTimer) {
          clearTimeout(this.logQueueTimer)
          this.logQueueTimer = null
        }
        return
      }
      
      // 取出队列中的第一个日志
      const log = this.logQueue.shift()
      
      // 添加日志到显示列表
      this.logs.unshift(log)
      
      // 限制日志数量，最多保留50条
      if (this.logs.length > 50) {
        this.logs.pop()
      }
      
      // 设置定时器处理下一条日志
      this.logQueueTimer = setTimeout(() => {
        this.processLogQueue()
      }, this.logDelayTime)
    },
    updateCooldowns(timeElapsed = 100) {
      // 计算实际需要执行的次数（基于100ms间隔）
      const executions = Math.floor(timeElapsed / 100)
      
      for (let i = 0; i < executions; i++) {
        // 每100ms执行一次的逻辑
        if (this.cooldowns.wood > 0) {
          this.cooldowns.wood -= 0.1
          if (this.cooldowns.wood < 0) {
            this.cooldowns.wood = 0
          }
        }
        if (this.cooldowns.trap > 0) {
          this.cooldowns.trap -= 0.1
          if (this.cooldowns.trap < 0) {
            this.cooldowns.trap = 0
          }
        }
        
        // 火堆状态降级逻辑：每二十分钟不添柴火堆就会降一等级直至熄灭
        if (this.buildings.fire > 0) {
          this.buildings.fireTimer += 0.1 // 每次增加0.1秒
          // 20分钟 = 1200秒
          if (this.buildings.fireTimer >= 60 * 20) {
            this.buildings.fireTimer = 0 // 重置定时器
            if (this.buildings.fire > 1) {
              this.buildings.fire -= 1
              this.addLog(`火堆许久没有添柴，火焰渐渐微弱`)
              // 播放新状态的音效
              // audioPlayer.play(this.fireLevelSounds[this.buildings.fire], true)
            } else {
              // 火堆熄灭
              this.buildings.fire = 0
              this.addLog('火堆最终熄灭了，只剩下一堆灰烬，小屋变得寒冷起来', 2)
              // 停止所有音效
              // audioPlayer.stop()
            }
            this.saveGameState()
          }
        }
        
        // 增加资源计数器
        this.resourceTimerCounter++
        // 每100次触发一次（10秒）
        if (this.resourceTimerCounter >= 100) {
          this.resourceTimerCounter = 0
          // 触发所有资源增加逻辑
          this.increaseResourcesByCart()
          this.increaseResourcesByJobs()
          
          // 天灾系统定时器（每10秒更新一次）
          if (this.buildings.village >= 10) {
            this.updateDisasterTimers()
          }
        }
      }
    },
    
    // 更新天灾系统定时器
    updateDisasterTimers() {
      // 如果天灾正在显示，不更新定时器
      if (this.disasterSystem.disasterActive) return
      
      // 统一的天灾定时器（5-15分钟）
      this.disasterSystem.timer += 10 // 每次增加10秒
      if (this.disasterSystem.timer >= this.disasterSystem.nextDisasterTime * 60) {
        this.disasterSystem.timer = 0
        this.disasterSystem.nextDisasterTime = Math.floor(Math.random() * (defaultSettings.disaster.cd.max - defaultSettings.disaster.cd.min + 1)) + defaultSettings.disaster.cd.min // 重置为5-15分钟
        
        // 随机选择触发火灾或猎物狂暴
        const hasHunters = this.jobs.hunter > 0
        if (hasHunters && Math.random() > 0.5) {
          // 有猎人且随机选择猎物狂暴
          this.triggerHunterRageDisaster()
        } else {
          // 触发火灾
          this.triggerFireDisaster()
        }
      }
    },
    
    // 触发火灾天灾
    triggerFireDisaster() {
      // 如果已有天灾活跃，不触发新的天灾
      if (this.disasterSystem.disasterActive) return
      
      // 标记天灾开始
      this.disasterSystem.disasterActive = true
      
      // 计算烧掉的小屋数量（1-2个）
      const hutsBurned = Math.floor(Math.random() * (defaultSettings.disaster.fire.maxHutsBurned - defaultSettings.disaster.fire.minHutsBurned + 1)) + defaultSettings.disaster.fire.minHutsBurned
      // 计算需要去除的人员数量（每个小屋最多容纳的人数）
      const peoplePerCabin = defaultSettings.building.cabin.maxPopulationPerCabin
      const peopleToRemove = Math.min(hutsBurned * peoplePerCabin, this.population)
      
      // 减少小屋数量
      this.buildings.village = Math.max(0, this.buildings.village - hutsBurned)
      
      if (peopleToRemove > 0) {
        // 先从闲散人员中去除
        const totalJobs = Object.values(this.jobs).reduce((sum, count) => sum + count, 0)
        const idlePeople = this.population - totalJobs
        
        if (idlePeople >= peopleToRemove) {
          // 闲散人员足够，不需要调整工种人数
          this.population -= peopleToRemove
        } else {
          // 闲散人员不足，需要按比例从工种人员中减人
          this.population -= peopleToRemove
          const remainingToRemove = peopleToRemove - idlePeople
          
          // 计算各工种人数比例
          const jobCounts = Object.entries(this.jobs)
          const totalJobPeople = totalJobs
          
          // 按比例减人
          let remainingToRemoveAfterAllocation = remainingToRemove
          const removalCounts = {}
          
          // 第一次分配：计算每个工种应减少的人数（向下取整）
          jobCounts.forEach(([jobId, count]) => {
            if (count > 0) {
              const removalCount = Math.floor((count / totalJobPeople) * remainingToRemove)
              removalCounts[jobId] = removalCount
              remainingToRemoveAfterAllocation -= removalCount
            } else {
              removalCounts[jobId] = 0
            }
          })
          
          // 第二次分配：处理剩余的人数（向上取整的余数）
          if (remainingToRemoveAfterAllocation > 0) {
            // 按人数比例排序，优先分配给人数多的工种
            const sortedJobs = [...jobCounts].sort(([,a], [,b]) => b - a)
            
            // 分配剩余的人数
            for (let i = 0; i < remainingToRemoveAfterAllocation && i < sortedJobs.length; i++) {
              const [jobId] = sortedJobs[i]
              if (this.jobs[jobId] > 0) {
                removalCounts[jobId]++
              }
            }
          }
          
          // 应用减少的人数
          Object.entries(removalCounts).forEach(([jobId, removalCount]) => {
            if (removalCount > 0) {
              this.jobs[jobId] = Math.max(0, this.jobs[jobId] - removalCount)
            }
          })
        }
      }
      
      // 显示灾难模态框
      eventBus.emit('disasterOccurred', {
        type: 'fire',
        data: {
          hutsBurned: hutsBurned,
          peopleLost: peopleToRemove
        }
      })
    },
    
    // 触发猎物狂暴天灾
    triggerHunterRageDisaster() {
      // 如果已有天灾活跃，不触发新的天灾
      if (this.disasterSystem.disasterActive) return
      
      if (this.jobs.hunter <= 0) return
      
      // 标记天灾开始
      this.disasterSystem.disasterActive = true
      
      // 计算丢失的猎人数量（至少1个，最多猎人总数的20%）
      const minLoss = defaultSettings.disaster.hunterRage.minLoss
      const maxLoss = Math.ceil(this.jobs.hunter * defaultSettings.disaster.hunterRage.maxLossPercentage)
      const huntersLost = Math.floor(Math.random() * (maxLoss - minLoss + 1)) + minLoss
      
      // 减少猎人数量
      this.jobs.hunter = Math.max(0, this.jobs.hunter - huntersLost)
      this.population = Math.max(0, this.population - huntersLost)
      
      // 显示灾难模态框
      eventBus.emit('disasterOccurred', {
        type: 'hunterRage',
        data: {
          peopleLost: huntersLost
        }
      })
    },
    
    // 处理灾难确认
    handleDisasterConfirm(disaster) {
      // 标记天灾结束
      this.disasterSystem.disasterActive = false
      
      // 重置统一的天灾CD
      this.disasterSystem.timer = 0
      this.disasterSystem.nextDisasterTime = Math.floor(Math.random() * (defaultSettings.disaster.cd.max - defaultSettings.disaster.cd.min + 1)) + defaultSettings.disaster.cd.min // 重置为5-15分钟
      
      // 检查是否需要继续让人员来到村落
      const maxPossiblePopulation = this.buildings.village * defaultSettings.building.cabin.maxPopulationPerCabin
      if (this.buildings.village > 0 && this.population < maxPossiblePopulation) {
        this.startPopulationArrival()
      }
      
      switch (disaster.type) {
        case 'fire':
          this.addLog(`火灾烧掉了${disaster.data.hutsBurned}个小屋，${disaster.data.peopleLost}人不幸遇难`, 2)
          break
        case 'hunterRage':
          this.addLog(`猎物狂暴导致${disaster.data.peopleLost}名猎人遇难`, 2)
          break
      }
      this.saveGameState()
    },
    
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      if (this.darkMode) {
        this.addLog('切换到暗黑模式')
      } else {
        this.addLog('切换到亮色模式')
      }
      this.saveGameState()
    },
    initGameLog() {
      this.addLog('🎯 任务：点燃火堆')
      this.addLog('寒冷的夜晚即将来临，你需要收集木材并点燃火堆来取暖。')
      this.addLog('提示：点击\'收集木材\'按钮获取木材，然后点击\'点燃火堆\'按钮生火。')
    },
    resetGame() {
      if (confirm('⚠️ 警告：重置游戏将会清空所有游戏数据。此操作不可恢复！\n\n确定要重置游戏吗？')) {
        const currentDarkMode = this.darkMode
        this.$reset()
        this.darkMode = currentDarkMode
        this.cooldowns = {
          wood: 0,
          trap: 0
        }
        // 重置日志队列相关状态
        this.logQueue = []
        if (this.logQueueTimer) {
          clearTimeout(this.logQueueTimer)
          this.logQueueTimer = null
        }
        this.addLog('游戏已重置', 1)
        this.saveGameState()
        // 初始化任务进场话术
        this.initGameLog()
        // 触发重置标签页事件
        eventBus.emit('resetTab')
      }
    },
    saveGameState() {
      try {
        const gameState = {
          stores: {
            wood: this.stores.wood,
            meat: this.stores.meat,
            fur: this.stores.fur,
            bacon: this.stores.bacon,
            leather: this.stores.leather
          },
          darkMode: this.darkMode,
          population: this.population,
          buildings: {
            fire: this.buildings.fire,
            fireTimer: this.buildings.fireTimer,
            village: this.buildings.village,
            cart: this.buildings.cart,
            huntingCabin: this.buildings.huntingCabin,
            smokehouseCabin: this.buildings.smokehouseCabin,
            tanneryCabin: this.buildings.tanneryCabin,
            tradingPost: this.buildings.tradingPost,
            workshop: this.buildings.workshop,
            traps: this.buildings.traps,
          },
          jobs: this.jobs
        }
        const gameStateJson = JSON.stringify(gameState)
        const gameStateBase64 = btoa(unescape(encodeURIComponent(gameStateJson)))
        localStorage.setItem('darkRoomGameState', gameStateBase64)
      } catch (error) {
        console.error('保存游戏状态失败:', error)
      }
    },
    loadGameState() {
      try {
        const gameStateBase64 = localStorage.getItem('darkRoomGameState')
        if (gameStateBase64) {
          const gameStateJson = decodeURIComponent(escape(atob(gameStateBase64)))
          const loadedState = JSON.parse(gameStateJson)
          
          if (loadedState.stores) {
            this.stores.wood = loadedState.stores.wood || 0
            this.stores.meat = loadedState.stores.meat || 0
            this.stores.fur = loadedState.stores.fur || 0
            this.stores.bacon = loadedState.stores.bacon || 0
            this.stores.leather = loadedState.stores.leather || 0
          }
          
          this.darkMode = loadedState.darkMode || false
          this.population = loadedState.population || 0
          
          if (loadedState.buildings) {
            this.buildings.fire = loadedState.buildings.fire || 0
            this.buildings.fireTimer = loadedState.buildings.fireTimer || 0
            this.buildings.village = loadedState.buildings.village || 0
            this.buildings.cart = loadedState.buildings.cart || 0
            this.buildings.huntingCabin = loadedState.buildings.huntingCabin || 0
            this.buildings.smokehouseCabin = loadedState.buildings.smokehouseCabin || 0
            this.buildings.tanneryCabin = loadedState.buildings.tanneryCabin || 0
            this.buildings.tradingPost = loadedState.buildings.tradingPost || 0
            this.buildings.workshop = loadedState.buildings.workshop || 0
            this.buildings.traps = loadedState.buildings.traps || 0
          }
          
          this.jobs = loadedState.jobs || {
            lumberjack: 0,
            hunter: 0,
            butcher: 0,
            tanner: 0
          }
          this.cooldowns = {
            wood: 0,
            trap: 0
          }
          // 重置日志队列相关状态
          this.logQueue = []
          if (this.logQueueTimer) {
            clearTimeout(this.logQueueTimer)
            this.logQueueTimer = null
          }
          this.addLog('游戏已加载', 1)
          // 如果村庄有小屋且人口未满，启动人口到达定时器
          if (this.buildings.village > 0 && this.population < this.buildings.village * defaultSettings.building.cabin.maxPopulationPerCabin) {
            this.startPopulationArrival()
          }
          return true
        }
      } catch (error) {
        console.error('加载游戏状态失败:', error)
      }
      return false
    },
    exportGame() {
      try {
        const gameState = {
          stores: {
            wood: this.stores.wood,
            meat: this.stores.meat,
            fur: this.stores.fur,
            bacon: this.stores.bacon,
            leather: this.stores.leather
          },
          darkMode: this.darkMode,
          population: this.population,
          buildings: {
            fire: this.buildings.fire,
            fireTimer: this.buildings.fireTimer,
            village: this.buildings.village,
            cart: this.buildings.cart,
            huntingCabin: this.buildings.huntingCabin,
            smokehouseCabin: this.buildings.smokehouseCabin,
            tanneryCabin: this.buildings.tanneryCabin,
            tradingPost: this.buildings.tradingPost,
            workshop: this.buildings.workshop,
            traps: this.buildings.traps,
          },
          jobs: this.jobs
        }
        const gameStateJson = JSON.stringify(gameState)
        const gameStateBase64 = btoa(unescape(encodeURIComponent(gameStateJson)))
        prompt('游戏导出成功！请复制以下Base64字符串保存:', gameStateBase64)
        this.addLog('游戏已导出', 1)
      } catch (error) {
        console.error('导出游戏状态失败:', error)
        this.addLog('导出游戏失败', 2)
      }
    },
    importGame() {
      try {
        const gameStateBase64 = prompt('请粘贴Base64字符串导入游戏:')
        if (gameStateBase64) {
          const gameStateJson = decodeURIComponent(escape(atob(gameStateBase64)))
          const loadedState = JSON.parse(gameStateJson)
          
          if (loadedState.stores) {
            this.stores.wood = loadedState.stores.wood || 0
            this.stores.meat = loadedState.stores.meat || 0
            this.stores.fur = loadedState.stores.fur || 0
            this.stores.bacon = loadedState.stores.bacon || 0
            this.stores.leather = loadedState.stores.leather || 0
          }
          
          this.darkMode = loadedState.darkMode || false
          this.population = loadedState.population || 0
          
          if (loadedState.buildings) {
            this.buildings.fire = loadedState.buildings.fire || 0
            this.buildings.fireTimer = loadedState.buildings.fireTimer || 0
            this.buildings.village = loadedState.buildings.village || 0
            this.buildings.cart = loadedState.buildings.cart || 0
            this.buildings.huntingCabin = loadedState.buildings.huntingCabin || 0
            this.buildings.smokehouseCabin = loadedState.buildings.smokehouseCabin || 0
            this.buildings.tanneryCabin = loadedState.buildings.tanneryCabin || 0
            this.buildings.tradingPost = loadedState.buildings.tradingPost || 0
            this.buildings.workshop = loadedState.buildings.workshop || 0
            this.buildings.traps = loadedState.buildings.traps || 0
          }
          
          this.jobs = loadedState.jobs || {
            lumberjack: 0,
            hunter: 0,
            butcher: 0,
            tanner: 0
          }
          this.cooldowns = {
            wood: 0,
            trap: 0
          }
          // 重置日志队列相关状态
          this.logQueue = []
          if (this.logQueueTimer) {
            clearTimeout(this.logQueueTimer)
            this.logQueueTimer = null
          }
          this.saveGameState()
          // 触发重置标签页事件
          eventBus.emit('resetTab')
          this.addLog('游戏已导入', 1)
          // 如果村落有小屋且人口未满，启动人口到达定时器
          if (this.buildings.village > 0 && this.population < this.buildings.village * defaultSettings.building.cabin.maxPopulationPerCabin) {
            this.startPopulationArrival()
          }
        }
      } catch (error) {
        console.error('导入游戏状态失败:', error)
        this.addLog('导入游戏失败', 2)
      }
    }
  }
})
