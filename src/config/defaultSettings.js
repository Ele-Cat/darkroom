// 系统配置项
const defaultSettings = {
  // 收集配置
  collection: {
    // 木材配置
    wood: {
      amount: 5, // 每次收集的数量
      cooldown: 5, // 冷却时间（秒）
      maxCooldown: 5 // 最大冷却时间（秒）
    },
    // 石头配置
    stone: {
      amount: 5, // 每次收集的数量
      cooldown: 5, // 冷却时间（秒）
      maxCooldown: 5 // 最大冷却时间（秒）
    }
  },
  // 搭建配置
  building: {
    // 小屋配置
    cabin: {
      baseWoodCost: 50, // 基础木材需求
      baseStoneCost: 50, // 基础石头需求
      woodCostIncreasePerLevel: 50, // 每级木材需求增加量
      stoneCostIncreasePerLevel: 50, // 每级石头需求增加量
      maxPopulationPerCabin: 4 // 每间小屋最大人口
    },
    // 货车配置
    cart: {
      woodCost: 20, // 解锁货车需要的木材
      resourceIncrease: 2, // 每十秒增加的资源数量
      interval: 10 // 增加资源的间隔（秒）
    },
    // 陷阱配置
    trap: {
      initialWoodCost: 10, // 首次部署需要的木材
      initialStoneCost: 10, // 首次部署需要的石头
      woodCostIncrease: 10, // 每次部署增加的木材
      stoneCostIncrease: 10, // 每次部署增加的石头
      maxTraps: 10, // 最多可部署的陷阱数量
      checkCooldown: 30, // 查看陷阱的冷却时间（秒）
      maxCheckCooldown: 30 // 查看陷阱的最大冷却时间（秒）
    }
  },
  // 人口配置
  population: {
    arrivalTimeMin: 5, // 人口到达最小时间（秒）
    arrivalTimeMax: 30, // 人口到达最大时间（秒）
    arrivalCountMin: 1, // 每次到达最小人数
    arrivalCountMax: 3 // 每次到达最大人数
  },
  // 村落解锁配置
  village: {
    unlockWoodCost: 10, // 解锁村落需要的木材
    unlockStoneCost: 10 // 解锁村落需要的石头
  },
  // Buff配置
  buffs: {
    // 货车buff
    cart: {
      wood: 2, // 每十秒增加木材
      stone: 2, // 每十秒增加石头
    }
  },
  // 工作模块配置
  jobs: {
    // 工种配置
    types: [
      {
        id: 'lumberjack',
        name: '伐木工',
        description: '增加木材产量',
        wood: 1 // 每十秒增加木材
      },
      {
        id: 'miner',
        name: '采石工',
        description: '增加石头产量',
        stone: 1 // 每十秒增加石头
      },
      {
        id: 'hunter',
        name: '猎人',
        description: '增加生肉和毛皮产量',
        meat: 0.5, // 每十秒增加生肉
        fur: 0.5 // 每十秒增加毛皮
      },
      {
        id: 'butcher',
        name: '熏肉师',
        description: '将生肉加工成熏肉',
        bacon: 1, // 每十秒生产熏肉
        consume_meat: 5, // 每十秒消耗生肉
        consume_wood: 5 // 每十秒消耗木材
      },
      {
        id: 'tanner',
        name: '皮革师',
        description: '将毛皮加工成皮革',
        leather: 1, // 每十秒生产皮革
        consume_fur: 5 // 每十秒消耗毛皮
      }
    ]
  },
  // 狩猎小屋配置
  hunting: {
    cabin: {
      woodCost: 250, // 解锁需要的木材
      stoneCost: 250, // 解锁需要的石头
      unlockLevel: 3 // 解锁需要的小屋等级
    }
  },
  // 制革小屋配置
  tannery: {
    cabin: {
      woodCost: 350, // 解锁需要的木材
      stoneCost: 350, // 解锁需要的石头
      unlockLevel: 5 // 解锁需要的小屋等级
    }
  },
  // 工坊配置
  workshop: {
    cabin: {
      woodCost: 500, // 解锁需要的木材
      stoneCost: 500, // 解锁需要的石头
      unlockLevel: 7 // 解锁需要的小屋等级
    }
  },
  // 制造配置
  crafting: {
    tools: [
      {
        id: 'stoneAxe',
        name: '石斧',
        woodCost: 30,
        stoneCost: 50,
        woodEfficiency: 10,
        stoneEfficiency: 0
      }
    ]
  },
  // 天灾系统配置
  disaster: {
    // 统一的天灾CD时间范围（分钟）
    cd: {
      min: 10, // 最小CD时间（分钟）
      max: 15 // 最大CD时间（分钟）
    },
    // 火灾天灾配置
    fire: {
      minHutsBurned: 1, // 最少烧掉的小屋数量
      maxHutsBurned: 2, // 最多烧掉的小屋数量
    },
    // 猎物狂暴天灾配置
    hunterRage: {
      minLoss: 1, // 最少损失的猎人数量
      maxLossPercentage: 0.1 // 最多损失猎人总数的百分比
    }
  }
}

export default defaultSettings