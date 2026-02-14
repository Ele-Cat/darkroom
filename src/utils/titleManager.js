/**
 * 标题管理器
 * 用于管理浏览器标题的动态切换和页面可见性检测
 */

class TitleManager {
  constructor() {
    this.originalTitle = document.title
    this.titleSwitchInterval = null
    this.isTabActive = true
    this.messageTitle = '*** 消息 ***'
    this.baseTitle = 'A dark room'
  }

  /**
   * 初始化标题管理器
   */
  init() {
    this.originalTitle = document.title
    this.addVisibilityListener()
  }

  /**
   * 添加页面可见性监听器
   */
  addVisibilityListener() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  /**
   * 移除页面可见性监听器
   */
  removeVisibilityListener() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
  }

  /**
   * 处理页面可见性变化
   */
  handleVisibilityChange() {
    this.isTabActive = document.hidden === false
  }

  /**
   * 更新浏览器标题
   * @param {string} tab - 当前标签页
   * @param {object} gameStore - 游戏状态
   * @param {boolean} showModal - 是否显示模态框
   * @returns {string} 更新后的标题
   */
  updateBrowserTitle(tab, gameStore, showModal = false) {
    let newTitle
    
    switch (tab) {
      case 'cabin':
        newTitle = `${gameStore.buildings.fire > 0 ? '林中小屋' : '废弃小屋'} - ${this.baseTitle}`
        break
      case 'village':
        newTitle = `${gameStore.getVillageName()} - ${this.baseTitle}`
        break
      case 'explore':
        newTitle = `探索 - ${this.baseTitle}`
        break
      default:
        newTitle = this.baseTitle
    }
    
    this.originalTitle = newTitle
    
    // 如果当前没有弹框，更新标题
    if (!showModal) {
      document.title = newTitle
    }
    
    return newTitle
  }

  /**
   * 开始标题切换
   * @param {string} [customMessage] - 自定义消息标题
   * @param {number} [interval=1500] - 切换间隔（毫秒）
   */
  startTitleSwitch(customMessage = null, interval = 1500) {
    // 清除已有的定时器
    this.clearTitleSwitchInterval()
    
    // 保存原始标题
    if (document.title !== this.messageTitle && document.title !== customMessage) {
      this.originalTitle = document.title
    }
    
    const messageTitle = customMessage || this.messageTitle
    
    // 开始切换标题
    let isMessageTitle = false
    this.titleSwitchInterval = setInterval(() => {
      if (isMessageTitle) {
        document.title = this.originalTitle
      } else {
        document.title = messageTitle
      }
      isMessageTitle = !isMessageTitle
    }, interval)
  }

  /**
   * 清除标题切换定时器
   */
  clearTitleSwitchInterval() {
    if (this.titleSwitchInterval) {
      clearInterval(this.titleSwitchInterval)
      this.titleSwitchInterval = null
    }
  }

  /**
   * 恢复原始标题
   */
  restoreOriginalTitle() {
    this.clearTitleSwitchInterval()
    document.title = this.originalTitle
  }

  /**
   * 检查页面是否可见
   * @returns {boolean} 是否可见
   */
  isPageVisible() {
    return this.isTabActive
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.clearTitleSwitchInterval()
    this.removeVisibilityListener()
  }
}

// 导出单例实例
const titleManager = new TitleManager()
export default titleManager
