import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const STORAGE_PREFIX = "motive:route-param:";

/** 라우터 param 상태 */
export type RouterState<T = unknown> = {
  param: T;
};

/**
 * 페이지 이동 시 sessionStorage로 데이터를 함께 넘기기 위한 라우터 유틸.
 * 민감정보(토큰 등)는 절대 이 유틸로 넘기지 말 것 — 암호화하지 않는다.
 */
class Router {
  private router: AppRouterInstance;

  constructor(router: AppRouterInstance) {
    this.router = router;
  }

  /**
   * 라우터 push
   * @param state.param 목적지 페이지에서 getData()로 꺼내 쓸 데이터
   */
  push = <T>(path: string, state?: RouterState<T>) => {
    if (state) this.setData(path, state.param);

    if (typeof window !== "undefined" && window.location.pathname === path) {
      this.router.refresh();
      return;
    }

    this.router.push(path);
  };

  replace = <T>(path: string, state?: RouterState<T>) => {
    if (state) this.setData(path, state.param);

    this.router.replace(path);
  };

  /**
   * 이전 페이지에서 push/replace 시 넘긴 데이터를 꺼낸다.
   * 삭제하지 않으므로 재렌더링돼도 값은 유지된다 — 다 쓴 뒤에는
   * clear(path)를 명시적으로 호출해 정리할 것 (useEffect 등에서 1회).
   * @param path 생략 시 현재 경로(window.location.pathname) 기준으로 조회
   */
  getData = <T>(path?: string): T | undefined => {
    if (typeof window === "undefined") return undefined;

    const raw = window.sessionStorage.getItem(
      this.storageKey(path ?? window.location.pathname),
    );
    if (!raw) return undefined;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  };

  clear(path: string) {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(this.storageKey(path));
    }
  }

  main() {
    this.push("/");
  }

  back() {
    this.router.back();
  }

  private setData(path: string, param: unknown) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(this.storageKey(path), JSON.stringify(param));
  }

  private storageKey(path: string) {
    return `${STORAGE_PREFIX}${path}`;
  }
}

export default Router;
