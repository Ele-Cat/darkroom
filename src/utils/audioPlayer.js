/**
 * 音频播放工具类
 * 用于控制播放public/audio里的音频文件
 * 支持通过audioLibrary的key来播放音频
 * 支持循环播放和单次播放
 * 处理浏览器的音频自动播放限制
 */
class AudioPlayer {
  constructor() {
    this.audioElements = new Map(); // 存储音频元素
    this.isAudioEnabled = false; // 音频是否已启用
    this.audioLibrary = null; // 音频库
  }

  /**
   * 初始化音频播放器
   * @param {Object} library - 音频库对象
   */
  init(library) {
    this.audioLibrary = library;
  }

  /**
   * 启用音频
   * 用于处理浏览器的音频自动播放限制
   * 需要用户点击按钮触发
   */
  enableAudio() {
    this.isAudioEnabled = true;
    // 创建一个静音的音频元素并播放，以获得音频播放权限
    const silentAudio = new Audio();
    silentAudio.muted = true;
    silentAudio.play().catch(() => {
      // 忽略错误，这只是为了获得音频播放权限
    });
  }

  /**
   * 检查音频是否已启用
   * @returns {boolean} 音频是否已启用
   */
  getAudioEnabled() {
    return this.isAudioEnabled;
  }

  /**
   * 播放音频
   * @param {string} key - 音频库中的键
   * @param {boolean} loop - 是否循环播放
   * @returns {Promise<Audio>} 音频元素
   */
  playAudio(key, loop = false) {
    if (!this.isAudioEnabled) {
      console.warn('音频未启用，请先调用enableAudio()');
      return Promise.reject(new Error('音频未启用'));
    }

    if (!this.audioLibrary || !this.audioLibrary[key]) {
      console.warn(`音频键不存在: ${key}`);
      return Promise.reject(new Error(`音频键不存在: ${key}`));
    }

    const audioPath = this.audioLibrary[key];
    const audioUrl = `/${audioPath}`; // 假设音频文件在public目录下

    // 检查是否已经创建了该音频元素
    if (this.audioElements.has(key)) {
      const audio = this.audioElements.get(key);
      audio.currentTime = 0;
      audio.loop = loop;
      return audio.play();
    }

    // 创建新的音频元素
    const audio = new Audio(audioUrl);
    audio.loop = loop;
    
    // 存储音频元素
    this.audioElements.set(key, audio);

    // 播放音频
    return audio.play();
  }

  /**
   * 停止播放音频
   * @param {string} key - 音频库中的键
   */
  stopAudio(key) {
    if (this.audioElements.has(key)) {
      const audio = this.audioElements.get(key);
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * 暂停播放音频
   * @param {string} key - 音频库中的键
   */
  pauseAudio(key) {
    if (this.audioElements.has(key)) {
      const audio = this.audioElements.get(key);
      audio.pause();
    }
  }

  /**
   * 恢复播放音频
   * @param {string} key - 音频库中的键
   * @returns {Promise} 播放Promise
   */
  resumeAudio(key) {
    if (this.audioElements.has(key)) {
      const audio = this.audioElements.get(key);
      return audio.play();
    }
    return Promise.reject(new Error(`音频键不存在: ${key}`));
  }

  /**
   * 设置音频音量
   * @param {string} key - 音频库中的键
   * @param {number} volume - 音量值，范围0-1
   */
  setVolume(key, volume) {
    if (this.audioElements.has(key)) {
      const audio = this.audioElements.get(key);
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 设置所有音频的音量
   * @param {number} volume - 音量值，范围0-1
   */
  setAllVolume(volume) {
    for (const audio of this.audioElements.values()) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 停止所有音频
   */
  stopAllAudio() {
    for (const audio of this.audioElements.values()) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  /**
   * 暂停所有音频
   */
  pauseAllAudio() {
    for (const audio of this.audioElements.values()) {
      audio.pause();
    }
  }

  /**
   * 恢复所有音频
   */
  resumeAllAudio() {
    for (const audio of this.audioElements.values()) {
      audio.play().catch(() => {
        // 忽略错误
      });
    }
  }

  /**
   * 销毁音频播放器
   * 清理所有音频元素
   */
  destroy() {
    this.stopAllAudio();
    this.audioElements.clear();
  }
}

// 导出单例实例
const audioPlayer = new AudioPlayer();
export default audioPlayer;