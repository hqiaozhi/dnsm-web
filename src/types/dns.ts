// DNS相关数据类型定义

// 通用API响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// API返回的DNS记录接口（大写字段名）
export interface DNSRecordAPI {
  Name?: string;     // 记录名称
  Type?: string;     // 记录类型 (A, CNAME等)
  Value?: string;    // 记录值
  TTL?: number;      // TTL值
  Priority?: number; // MX记录的优先级
}

// 应用内部使用的DNS记录接口（小写字段名）
export interface DNSRecord {
  id?: string;      // 记录ID (作为列表唯一key使用)
  name: string;     // 记录名称
  type: string;     // 记录类型 (A, CNAME等)
  value: string;    // 记录值
  ttl: number;      // TTL值
  priority?: number; // MX记录的优先级
}

// DNS域名接口
export interface DNSDomain {
  name: string;     // 域名名称
  recordCount?: number; // 记录数量
  records?: DNSRecord[];  // 域名下的记录列表
}

// 创建域名请求参数
export interface CreateDNSDomainParams {
  name: string;     // 域名名称
  records: DNSRecord[];  // 初始记录列表
}

// 创建记录请求参数
export interface CreateDNSRecordParams {
  name: string;     // 记录名称
  type: string;     // 记录类型
  value: string;    // 记录值
  ttl: number;      // TTL值
  priority?: number; // MX记录的优先级
}

// 更新记录请求参数
export interface UpdateDNSRecordParams {
  name: string;     // 新的记录名称
  type: string;     // 记录类型
  value: string;    // 记录值
  ttl: number;      // TTL值
  priority?: number; // MX记录的优先级
}

// 分页域名数据项
export interface DNSDomainListItem {
  name: string;         // 域名名称
  record_count: number; // 记录数量
}

// DNS域名列表数据格式（分页）
export interface DNSDomainListData {
  domains: DNSDomainListItem[]; // 域名列表
  total: number;                // 总数量
}

// DNS域名列表响应
export type DNSDomainListResponse = ApiResponse<DNSDomainListData>;

// DNS记录列表数据格式
export interface DNSRecordListData {
  items: DNSRecordAPI[];
  total: number;
}

// DNS记录列表响应
export type DNSRecordListResponse = ApiResponse<DNSRecordListData>;
