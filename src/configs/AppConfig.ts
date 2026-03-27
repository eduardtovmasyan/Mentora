class AppConfig {
  public get apiBaseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL ?? '/api'
  }

  public get appName(): string {
    return import.meta.env.VITE_APP_NAME ?? 'Mentora'
  }
}

export default new AppConfig()
