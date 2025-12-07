/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise<boolean> 复制是否成功
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // 现代浏览器，支持clipboard API
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 回退方案：创建textarea元素
      const textArea = document.createElement('textarea')
      textArea.value = text
      
      // 避免滚动到元素
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      // 执行复制命令
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}
