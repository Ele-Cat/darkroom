import { defineStore } from 'pinia'
import defaultSettings from '@/config/defaultSettings'
import eventBus from '@/utils/eventBus'

export const useGameStore = defineStore('game', {
  state: () => ({
    wood: 0,
    stone: 0,
    meat: 0,
    fur: 0,
    bacon: 0,
    leather: 0,
    fireLit: false,
    darkMode: true,
    villageLevel: 0,
    villageUnlocked: false,
    villageTabVisible: false,
    population: 0,
    populationTimer: null,
    cartUnlocked: false,
    huntingCabinUnlocked: false,
    tanneryCabinUnlocked: false,
    workshopUnlocked: false,
    stoneAxeUnlocked: false,
    jobModuleUnlocked: false,
    traps: 0,
    jobs: {
      lumberjack: 0,
      miner: 0,
      hunter: 0,
      butcher: 0,
      tanner: 0
    },
    cooldowns: {
      wood: 0,
      stone: 0,
      trap: 0
    },
    // 资源增加计数器（每100次触发一次，即10秒）
    resourceTimerCounter: 0,
    // 天灾系统
    disasterSystem: {
      timer: 0,
      nextDisasterTime: Math.floor(Math.random() * (defaultSettings.disaster.cd.max - defaultSettings.disaster.cd.min + 1)) + defaultSettings.disaster.cd.min, // 5-15分钟
      disasterActive: false // 标记是否有天灾正在显示
    },
    logs: [],
    // 日志队列，用于延迟显示
    logQueue: [],
    // 日志队列处理定时器
    logQueueTimer: null,
    // 日志延迟时间（毫秒）
    logDelayTime: 500
  }),
  getters: {
    canUnlockVillage: (state) => {
      return state.wood >= 10 && state.stone >= 10
    },
    canShowExploreTab: (state) => {
      return state.villageLevel >= 10
    },
    canShowVillageTab: (state) => {
      return state.villageTabVisible
    },
    maxPopulation: (state) => {
      return state.villageLevel * defaultSettings.building.cabin.maxPopulationPerCabin
    },
    // 物料buff效果
    materialBuffs: (state) => {
      const buffs = {
        wood: 0,
        stone: 0,
        meat: 0,
        fur: 0,
        bacon: 0,
        leather: 0
      }
      
      // 货车buff
      if (state.cartUnlocked) {
        buffs.wood += defaultSettings.buffs.cart.wood
        buffs.stone += defaultSettings.buffs.cart.stone
      }
      
      // 工作模块buff
      if (state.jobModuleUnlocked) {
        // 伐木工buff
        if (state.jobs.lumberjack > 0) {
          const lumberjackBuff = defaultSettings.jobs.types.find(job => job.id === 'lumberjack')
          if (lumberjackBuff) {
            let efficiencyMultiplier = 1
            if (state.stoneAxeUnlocked) {
              efficiencyMultiplier = 2
            }
            buffs.wood += state.jobs.lumberjack * lumberjackBuff.wood * efficiencyMultiplier
          }
        }
        // 采石工buff
        if (state.jobs.miner > 0) {
          const minerBuff = defaultSettings.jobs.types.find(job => job.id === 'miner')
          if (minerBuff) {
            let efficiencyMultiplier = 1
            if (state.stoneAxeUnlocked) {
              efficiencyMultiplier = 2
            }
            buffs.stone += state.jobs.miner * minerBuff.stone * efficiencyMultiplier
          }
        }
        // 猎人buff
        if (state.jobs.hunter > 0 && state.huntingCabinUnlocked) {
          const hunterBuff = defaultSettings.jobs.types.find(job => job.id === 'hunter')
          if (hunterBuff) {
            buffs.meat += state.jobs.hunter * hunterBuff.meat
            buffs.fur += state.jobs.hunter * hunterBuff.fur
          }
        }
        // 熏肉师buff
        if (state.jobs.butcher > 0 && state.huntingCabinUnlocked) {
          const butcherBuff = defaultSettings.jobs.types.find(job => job.id === 'butcher')
          if (butcherBuff) {
            buffs.bacon += state.jobs.butcher * butcherBuff.bacon
            buffs.wood -= state.jobs.butcher * butcherBuff.consume_wood
            buffs.meat -= state.jobs.butcher * butcherBuff.consume_meat
          }
        }
        // 皮革师buff
        if (state.jobs.tanner > 0 && state.tanneryCabinUnlocked) {
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
        stone: buffs.stone,
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
    // 工作模块是否解锁
    isJobModuleUnlocked: (state) => {
      return state.jobModuleUnlocked
    }
  },
  actions: {
    getVillageName() {
      const level = this.villageLevel
      if (level >= 41) {
        return '喧嚣城镇'
      } else if (level >= 31) {
        return '小型城镇'
      } else if (level >= 21) {
        return '大型村落'
      } else if (level >= 11) {
        return '中型村落'
      } else if (level >= 2) {
        return '小型村落'
      } else {
        return '村落'
      }
    },
    showVillageTab() {
      if (!this.villageTabVisible) {
        this.villageTabVisible = true
        this.addLog('村落区域已发现', 1)
        this.saveGameState()
      }
    },
    collectWood() {
      if (this.cooldowns.wood <= 0) {
        let woodAmount = defaultSettings.collection.wood.amount
        if (this.cartUnlocked) {
          woodAmount += 5
        }
        if (this.stoneAxeUnlocked) {
          woodAmount += defaultSettings.crafting.tools.find(tool => tool.id === 'stoneAxe').woodEfficiency
        }
        this.wood += woodAmount
        this.addLog(`你收集了${woodAmount}块木材`)
        this.cooldowns.wood = defaultSettings.collection.wood.cooldown
        this.saveGameState()
      }
    },
    collectStone() {
      if (this.cooldowns.stone <= 0) {
        let stoneAmount = defaultSettings.collection.stone.amount
        if (this.cartUnlocked) {
          stoneAmount += 5
        }
        if (this.stoneAxeUnlocked) {
          stoneAmount += defaultSettings.crafting.tools.find(tool => tool.id === 'stoneAxe').stoneEfficiency
        }
        this.stone += stoneAmount
        this.addLog(`你收集了${stoneAmount}块石头`)
        this.cooldowns.stone = defaultSettings.collection.stone.cooldown
        this.saveGameState()
      }
    },
    lightFire() {
      if (!this.fireLit) {
        if (this.wood >= 1) {
          this.wood -= 1
          this.fireLit = true
          this.addLog('你点燃了火堆', 1)
          this.saveGameState()
        } else {
          this.addLog('木材不足，无法点燃火堆', 2)
        }
      } else {
        if (this.wood >= 1) {
          this.wood -= 1
          this.addLog('你添柴加火，火堆熊熊燃烧')
          this.saveGameState()
        } else {
          this.addLog('木材不足，无法添柴加火', 2)
        }
      }
    },
    unlockVillage() {
      if (this.wood >= 10 && this.stone >= 10) {
        this.wood -= 10
        this.stone -= 10
        this.villageUnlocked = true
        this.addLog('你花费了10木材和10石头解锁了村落', 1)
        this.saveGameState()
      } else {
        this.addLog(`资源不足，需要10木材和10石头才能解锁村落`, 2)
      }
    },
    exploreVillage() {
      this.addLog('你探索了村落，发现了一些有用的资源')
      this.wood += Math.floor(Math.random() * 3) + 1
      this.stone += Math.floor(Math.random() * 2) + 1
      this.saveGameState()
    },
    buildStructure() {
      // 检查村落等级是否已达到上限
      if (this.villageLevel >= 50) {
        this.addLog('村落已达到最高等级50级，无法再升级', 2)
        return
      }
      
      // 使用配置项计算资源消耗
      const baseWoodCost = defaultSettings.building.cabin.baseWoodCost
      const baseStoneCost = defaultSettings.building.cabin.baseStoneCost
      const woodCostIncreasePerLevel = defaultSettings.building.cabin.woodCostIncreasePerLevel
      const stoneCostIncreasePerLevel = defaultSettings.building.cabin.stoneCostIncreasePerLevel
      const woodCost = baseWoodCost + Math.floor(this.villageLevel * woodCostIncreasePerLevel)
      const stoneCost = baseStoneCost + Math.floor(this.villageLevel * stoneCostIncreasePerLevel)
      
      // 校验资源是否足够
      if (this.wood >= woodCost && this.stone >= stoneCost) {
        this.wood -= woodCost
        this.stone -= stoneCost
        this.villageLevel += 1
        this.addLog(`你建造了小屋建筑，村落升级到${this.villageLevel}级`, 1)
        if (this.villageLevel === 1) {
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
      const maxTraps = defaultSettings.building.trap.maxTraps
      if (this.traps >= maxTraps) {
        this.addLog(`陷阱已达到最大数量${maxTraps}个，无法再部署`, 2)
        return
      }
      
      // 计算部署陷阱的成本
      const initialWoodCost = defaultSettings.building.trap.initialWoodCost
      const initialStoneCost = defaultSettings.building.trap.initialStoneCost
      const woodCostIncrease = defaultSettings.building.trap.woodCostIncrease
      const stoneCostIncrease = defaultSettings.building.trap.stoneCostIncrease
      
      const woodCost = initialWoodCost + this.traps * woodCostIncrease
      const stoneCost = initialStoneCost + this.traps * stoneCostIncrease
      
      if (this.wood >= woodCost && this.stone >= stoneCost) {
        this.wood -= woodCost
        this.stone -= stoneCost
        this.traps += 1
        this.addLog(`陷阱越多，抓到的猎物就越多，现共有${this.traps}个陷阱`)
        if (this.traps === maxTraps) {
          this.addLog('陷阱已达到最大数量', 2)
        }
        this.saveGameState()
      } else {
        this.addLog(`资源不足，需要${woodCost}木材和${stoneCost}石头才能部署陷阱`, 2)
      }
    },
    
    // 解锁货车
    unlockCart() {
      const woodCost = defaultSettings.building.cart.woodCost
      if (!this.cartUnlocked && this.wood >= woodCost) {
        this.wood -= woodCost
        this.cartUnlocked = true
        this.addLog('解锁货车，手动收集翻倍，每十秒自动增加木材和石头', 1)
        this.saveGameState()
      } else if (this.cartUnlocked) {
        this.addLog('货车已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁货车', 2)
      }
    },
    
    // 解锁狩猎小屋
    unlockHuntingCabin() {
      const woodCost = defaultSettings.hunting.cabin.woodCost
      const stoneCost = defaultSettings.hunting.cabin.stoneCost
      if (!this.huntingCabinUnlocked && this.wood >= woodCost && this.stone >= stoneCost) {
        this.wood -= woodCost
        this.stone -= stoneCost
        this.huntingCabinUnlocked = true
        this.addLog('你解锁了狩猎小屋，新增了猎人和熏肉师工作', 1)
        this.saveGameState()
      } else if (this.huntingCabinUnlocked) {
        this.addLog('狩猎小屋已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁狩猎小屋', 2)
      }
    },
    
    // 解锁制革小屋
    unlockTanneryCabin() {
      const woodCost = defaultSettings.tannery.cabin.woodCost
      const stoneCost = defaultSettings.tannery.cabin.stoneCost
      if (!this.tanneryCabinUnlocked && this.wood >= woodCost && this.stone >= stoneCost) {
        this.wood -= woodCost
        this.stone -= stoneCost
        this.tanneryCabinUnlocked = true
        this.addLog('你解锁了制革小屋，新增了皮革师工作', 1)
        this.saveGameState()
      } else if (this.tanneryCabinUnlocked) {
        this.addLog('制革小屋已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁制革小屋', 2)
      }
    },
    
    // 解锁工坊
    unlockWorkshop() {
      const woodCost = defaultSettings.workshop.cabin.woodCost
      const stoneCost = defaultSettings.workshop.cabin.stoneCost
      if (!this.workshopUnlocked && this.wood >= woodCost && this.stone >= stoneCost) {
        this.wood -= woodCost
        this.stone -= stoneCost
        this.workshopUnlocked = true
        this.addLog('你解锁了工坊，新增了制造功能', 1)
        this.saveGameState()
      } else if (this.workshopUnlocked) {
        this.addLog('工坊已经解锁', 1)
      } else {
        this.addLog('资源不足，无法解锁工坊', 2)
      }
    },
    
    // 解锁石斧
    unlockStoneAxe() {
      const woodCost = defaultSettings.crafting.tools.find(tool => tool.id === 'stoneAxe').woodCost
      const stoneCost = defaultSettings.crafting.tools.find(tool => tool.id === 'stoneAxe').stoneCost
      if (!this.stoneAxeUnlocked && this.wood >= woodCost && this.stone >= stoneCost) {
        this.wood -= woodCost
        this.stone -= stoneCost
        this.stoneAxeUnlocked = true
        this.addLog(`你花费了${woodCost}木材和${stoneCost}石头，成功解锁了石斧！`, 1)
        this.addLog('石斧的锋利刃口大幅提高了采集效率，伐木工和采石工的工作效率现在翻了一倍！', 1)
        this.saveGameState()
      } else if (this.stoneAxeUnlocked) {
        this.addLog('石斧已经解锁', 1)
      } else {
        this.addLog(`资源不足，无法解锁石斧。需要${woodCost}木材和${stoneCost}石头。`, 2)
      }
    },
    
    // 货车自动增加资源
    increaseResourcesByCart() {
      if (this.cartUnlocked) {
        const woodIncrease = defaultSettings.buffs.cart.wood
        const stoneIncrease = defaultSettings.buffs.cart.stone
        this.wood += woodIncrease
        this.stone += stoneIncrease
        this.saveGameState()
      }
    },
    
    // 工作模块自动增加资源
    increaseResourcesByJobs() {
      if (this.jobModuleUnlocked) {
        // 伐木工增加木材
        if (this.jobs.lumberjack > 0) {
          const lumberjackBuff = defaultSettings.jobs.types.find(job => job.id === 'lumberjack')
          if (lumberjackBuff) {
            // 计算效率乘数，考虑石斧的影响
            let efficiencyMultiplier = 1
            if (this.stoneAxeUnlocked) {
              efficiencyMultiplier = 2
            }
            const woodIncrease = this.jobs.lumberjack * lumberjackBuff.wood * efficiencyMultiplier
            this.wood += woodIncrease
          }
        }
        // 采石工增加石头
        if (this.jobs.miner > 0) {
          const minerBuff = defaultSettings.jobs.types.find(job => job.id === 'miner')
          if (minerBuff) {
            // 计算效率乘数，考虑石斧的影响
            let efficiencyMultiplier = 1
            if (this.stoneAxeUnlocked) {
              efficiencyMultiplier = 2
            }
            const stoneIncrease = this.jobs.miner * minerBuff.stone * efficiencyMultiplier
            this.stone += stoneIncrease
          }
        }
        // 猎人增加生肉和毛皮
        if (this.jobs.hunter > 0 && this.huntingCabinUnlocked) {
          const hunterBuff = defaultSettings.jobs.types.find(job => job.id === 'hunter')
          if (hunterBuff) {
            const meatIncrease = this.jobs.hunter * hunterBuff.meat
            const furIncrease = this.jobs.hunter * hunterBuff.fur
            this.meat += meatIncrease
            this.fur += furIncrease
          }
        }
        // 熏肉师生产熏肉（消耗生肉和木材）
        if (this.jobs.butcher > 0 && this.huntingCabinUnlocked) {
          const butcherBuff = defaultSettings.jobs.types.find(job => job.id === 'butcher')
          if (butcherBuff) {
            // 检查是否有足够的资源
            const requiredMeat = this.jobs.butcher * butcherBuff.consume_meat
            const requiredWood = this.jobs.butcher * butcherBuff.consume_wood
            
            if (this.meat >= requiredMeat && this.wood >= requiredWood) {
              const baconIncrease = this.jobs.butcher * butcherBuff.bacon
              this.bacon += baconIncrease
              this.meat -= requiredMeat
              this.wood -= requiredWood
            }
          }
        }
        // 皮革师生产皮革（消耗毛皮）
        if (this.jobs.tanner > 0 && this.tanneryCabinUnlocked) {
          const tannerBuff = defaultSettings.jobs.types.find(job => job.id === 'tanner')
          if (tannerBuff) {
            // 检查是否有足够的资源
            const requiredFur = this.jobs.tanner * tannerBuff.consume_fur
            
            if (this.fur >= requiredFur) {
              const leatherIncrease = this.jobs.tanner * tannerBuff.leather
              this.leather += leatherIncrease
              this.fur -= requiredFur
            }
          }
        }
        this.saveGameState()
      }
    },
    
    // 调整工种人数
    adjustJobCount(jobId, change) {
      // 确保jobs对象中存在对应的属性
      if (!this.jobs.hasOwnProperty(jobId)) {
        this.jobs[jobId] = 0
      }
      const newCount = this.jobs[jobId] + change
      const totalJobs = Object.values(this.jobs).reduce((sum, count) => sum + count, 0)
      const newTotalJobs = totalJobs + change
      
      // 确保人数不能为负数，且总人数不能超过人口总数
      if (newCount >= 0 && newTotalJobs <= this.population) {
        this.jobs[jobId] = newCount
        this.saveGameState()
      }
    },
    
    // 快速调整工种人数
    quickAdjustJobCount(jobId, change) {
      // 确保jobs对象中存在对应的属性
      if (!this.jobs.hasOwnProperty(jobId)) {
        this.jobs[jobId] = 0
      }
      
      let newCount
      if (change > 0) {
        // 增加人数：使用所有可用的闲散人员
        const idlePopulation = this.population - Object.values(this.jobs).reduce((sum, count) => sum + count, 0)
        newCount = this.jobs[jobId] + Math.min(change, idlePopulation)
      } else {
        // 减少人数：减少到至少0
        newCount = Math.max(0, this.jobs[jobId] + change)
      }
      
      // 确保人数不能为负数
      if (newCount >= 0) {
        this.jobs[jobId] = newCount
        this.saveGameState()
      }
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
      const maxPossiblePopulation = this.villageLevel * defaultSettings.building.cabin.maxPopulationPerCabin
      const availableSlots = maxPossiblePopulation - this.population
      const actualArrivalCount = Math.min(arrivalCount, availableSlots)
      
      if (actualArrivalCount > 0) {
        this.population += actualArrivalCount
        const scene = this.getArrivalScene()
        this.addLog(`${scene}，有${actualArrivalCount}人来到了你的村落`, 1)
        
        // 解锁工作模块
        if (!this.jobModuleUnlocked) {
          this.jobModuleUnlocked = true
          this.addLog('工作模块已解锁，你可以为村民分配工作了', 1)
          
          // 触发新村民到来事件，用于App组件切换tab
          eventBus.emit('newVillagersArrived')
        }
        
        this.saveGameState()
      }
      
      // 如果还有空槽位，继续启动定时器
      if (this.population < maxPossiblePopulation) {
        this.startPopulationArrival()
      }
    },
    // 查看陷阱按钮
    checkTraps() {
      if (this.cooldowns.trap > 0) return
      
      if (this.traps <= 0) {
        this.addLog('你还没有部署任何陷阱', 2)
        return
      }
      
      // 设置冷却时间
      this.cooldowns.trap = defaultSettings.building.trap.checkCooldown
      
      // 计算获得的资源数量（每个陷阱单独随机获得）
      let totalMeatAmount = 0
      let totalFurAmount = 0
      
      // 为每个陷阱单独计算获得的资源
      for (let i = 0; i < this.traps; i++) {
        totalMeatAmount += Math.floor(Math.random() * 3) // 每个陷阱获得0-2个生肉
        totalFurAmount += Math.floor(Math.random() * 3) // 每个陷阱获得0-2个毛皮
      }
      
      // 增加资源
      this.meat += totalMeatAmount
      this.fur += totalFurAmount
      this.addLog(`查看陷阱，你获得了生肉 ${totalMeatAmount}，毛皮 ${totalFurAmount}`)
      
      // 20%的几率破坏一个陷阱
      if (Math.random() < 0.2) {
        this.traps -= 1
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
        if (this.cooldowns.stone > 0) {
          this.cooldowns.stone -= 0.1
          if (this.cooldowns.stone < 0) {
            this.cooldowns.stone = 0
          }
        }
        if (this.cooldowns.trap > 0) {
          this.cooldowns.trap -= 0.1
          if (this.cooldowns.trap < 0) {
            this.cooldowns.trap = 0
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
          if (this.villageLevel >= 10) {
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
      this.villageLevel = Math.max(0, this.villageLevel - hutsBurned)
      
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
      const maxPossiblePopulation = this.villageLevel * defaultSettings.building.cabin.maxPopulationPerCabin
      if (this.villageLevel > 0 && this.population < maxPossiblePopulation) {
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
          stone: 0,
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
      }
    },
    saveGameState() {
      try {
        const gameState = {
          wood: this.wood,
          stone: this.stone,
          meat: this.meat,
          fur: this.fur,
          bacon: this.bacon,
          leather: this.leather,
          fireLit: this.fireLit,
          darkMode: this.darkMode,
          villageLevel: this.villageLevel,
          villageUnlocked: this.villageUnlocked,
          population: this.population,
          cartUnlocked: this.cartUnlocked,
          huntingCabinUnlocked: this.huntingCabinUnlocked,
          tanneryCabinUnlocked: this.tanneryCabinUnlocked,
          workshopUnlocked: this.workshopUnlocked,
          stoneAxeUnlocked: this.stoneAxeUnlocked,
          jobModuleUnlocked: this.jobModuleUnlocked,
          traps: this.traps,
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
          this.wood = loadedState.wood || 0
          this.stone = loadedState.stone || 0
          this.meat = loadedState.meat || 0
          this.fur = loadedState.fur || 0
          this.bacon = loadedState.bacon || 0
          this.leather = loadedState.leather || 0
          this.fireLit = loadedState.fireLit || false
          this.darkMode = loadedState.darkMode || false
          this.villageLevel = loadedState.villageLevel || 0
          this.villageUnlocked = loadedState.villageUnlocked || false
          this.population = loadedState.population || 0
          this.cartUnlocked = loadedState.cartUnlocked || false
          this.huntingCabinUnlocked = loadedState.huntingCabinUnlocked || false
          this.tanneryCabinUnlocked = loadedState.tanneryCabinUnlocked || false
          this.workshopUnlocked = loadedState.workshopUnlocked || false
          this.stoneAxeUnlocked = loadedState.stoneAxeUnlocked || false
          this.jobModuleUnlocked = loadedState.jobModuleUnlocked || false
          this.traps = loadedState.traps || 0
          this.jobs = loadedState.jobs || {
            lumberjack: 0,
            miner: 0,
            hunter: 0,
            butcher: 0,
            tanner: 0
          }
          this.cooldowns = {
            wood: 0,
            stone: 0,
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
          if (this.villageLevel > 0 && this.population < this.villageLevel * defaultSettings.building.cabin.maxPopulationPerCabin) {
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
          wood: this.wood,
          stone: this.stone,
          meat: this.meat,
          fur: this.fur,
          bacon: this.bacon,
          leather: this.leather,
          fireLit: this.fireLit,
          darkMode: this.darkMode,
          villageLevel: this.villageLevel,
          villageUnlocked: this.villageUnlocked,
          population: this.population,
          cartUnlocked: this.cartUnlocked,
          huntingCabinUnlocked: this.huntingCabinUnlocked,
          tanneryCabinUnlocked: this.tanneryCabinUnlocked,
          jobModuleUnlocked: this.jobModuleUnlocked,
          traps: this.traps,
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
          this.wood = loadedState.wood || 0
          this.stone = loadedState.stone || 0
          this.meat = loadedState.meat || 0
          this.fur = loadedState.fur || 0
          this.bacon = loadedState.bacon || 0
          this.leather = loadedState.leather || 0
          this.fireLit = loadedState.fireLit || false
          this.darkMode = loadedState.darkMode || false
          this.villageLevel = loadedState.villageLevel || 0
          this.villageUnlocked = loadedState.villageUnlocked || false
          this.population = loadedState.population || 0
          this.cartUnlocked = loadedState.cartUnlocked || false
          this.huntingCabinUnlocked = loadedState.huntingCabinUnlocked || false
          this.tanneryCabinUnlocked = loadedState.tanneryCabinUnlocked || false
          this.workshopUnlocked = loadedState.workshopUnlocked || false
          this.stoneAxeUnlocked = loadedState.stoneAxeUnlocked || false
          this.jobModuleUnlocked = loadedState.jobModuleUnlocked || false
          this.traps = loadedState.traps || 0
          this.jobs = loadedState.jobs || {
            lumberjack: 0,
            miner: 0,
            hunter: 0,
            butcher: 0,
            tanner: 0
          }
          this.villageTabVisible = loadedState.villageTabVisible || false
          this.cooldowns = {
            wood: 0,
            stone: 0,
            trap: 0
          }
          // 重置日志队列相关状态
          this.logQueue = []
          if (this.logQueueTimer) {
            clearTimeout(this.logQueueTimer)
            this.logQueueTimer = null
          }
          this.saveGameState()
          this.addLog('游戏已导入', 1)
          // 如果村落有小屋且人口未满，启动人口到达定时器
          if (this.villageLevel > 0 && this.population < this.villageLevel * defaultSettings.building.cabin.maxPopulationPerCabin) {
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
