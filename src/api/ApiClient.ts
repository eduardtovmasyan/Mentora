import { BaseApiClient } from '@/api/BaseApiClient.ts'
import ApiClientConfig from '@/api/configs/ApiClientConfig.ts'

export class ApiClient extends BaseApiClient {
  constructor() {
    super(ApiClientConfig.baseUrl)
  }
}
