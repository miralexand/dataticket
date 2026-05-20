/**
 * 密码编码工具类
 * 使用 Base64 + 账号进行混合编码
 */
export class EncodedUtil {
  // 编码密钥
  private static matrixKey: string = '+CloudStudio';

  // 私有构造函数，防止实例化
  private constructor() {}

  /**
   * 将密码编码为Base64
   * 编码方式：Base64(密码 + 密钥 + 账号)
   * @param strPass 密码
   * @param strKey 账号
   * @returns 编码后的字符串
   */
  public static encodeToBase64(strPass: string, strKey: string): string {
    // 拼接：密码 + 密钥 + 账号
    const combined = strPass + this.matrixKey + strKey;
    // 使用 btoa 进行 Base64 编码
    return btoa(combined);
  }

  /**
   * 将Base64编码的字符串解码为原始字符串
   * @param encoded Base64编码的字符串
   * @returns 解码后的字符串
   */
  public static decodeFromBase64(encoded: string): string {
    return atob(encoded);
  }
}