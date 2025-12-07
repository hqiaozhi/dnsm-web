import request from './request'
import { 
  type CreateDNSDomainParams, 
  type CreateDNSRecordParams,
  type UpdateDNSRecordParams,
  type DNSDomainListResponse,
  type DNSRecordListResponse
} from '@/types/dns'

// 获取域名列表
export function getDNSDomainPageList(page: number, page_size: number): Promise<DNSDomainListResponse> {
  return request({
    url: '/api/v1/dns/page',
    method: 'get',
    params: {
      page: page,
      page_size: page_size
    }
  })
}




// 创建域名
export function createDNSDomain(data: CreateDNSDomainParams) {
  return request({
    url: '/api/v1/dns',
    method: 'post',
    data: data
  })
}

// 获取域名详情
export function getDNSDomainDetail(domainName: string) {
  return request({
    url: `/api/v1/dns/${domainName}`,
    method: 'get'
  })
}

// 删除域名
export function deleteDNSDomain(domainName: string) {
  return request({
    url: `/api/v1/dns/${domainName}`,
    method: 'delete'
  })
}

// 获取域名的记录列表
export function getDNSRecords(domainName: string): Promise<DNSRecordListResponse> {
  return request({
    url: `/api/v1/dns/${domainName}/records`,
    method: 'get'
  })
}

// 添加记录
export function addDNSRecord(domainName: string, data: CreateDNSRecordParams) {
  return request({
    url: `/api/v1/dns/${domainName}/records`,
    method: 'post',
    data: data
  })
}

// 更新记录
export function updateDNSRecord(domainName: string, recordName: string, data: UpdateDNSRecordParams) {
  return request({
    url: `/api/v1/dns/${domainName}/records/${recordName}`,
    method: 'put',
    data: data
  })
}

// 删除记录
export function deleteDNSRecord(domainName: string, recordName: string) {
  return request({
    url: `/api/v1/dns/${domainName}/records/${recordName}`,
    method: 'delete'
  })
}
