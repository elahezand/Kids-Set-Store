
import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    skipRefresh?: boolean;
  }
}