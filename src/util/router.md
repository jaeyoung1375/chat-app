# Router 유틸 (`util/router.ts`)

`next/navigation`의 `useRouter()`를 감싸서, 페이지 이동 시 sessionStorage로 데이터를 함께 넘길 수 있게 하는 유틸.

## 사용법

```ts
import { useRouter } from "next/navigation";
import Router from "@/util/router";

const router = new Router(useRouter());
```

### 데이터와 함께 이동

```ts
router.push(`/post/${postId}/edit`, {
  param: { techStackTypeCd: ["10", "20"], recruitPositTypeCd: "FE" },
});

router.replace(path, { param });
```

데이터 없이 이동할 땐 `state`를 생략한다.

```ts
router.push(path);
```

### 목적지 페이지에서 데이터 꺼내기

```ts
const router = new Router(useRouter());
const data = router.getData<{ techStackTypeCd: string[] }>();
```

- 경로를 생략하면 현재 경로(`window.location.pathname`) 기준으로 조회한다.
- 특정 경로를 지정하려면 `getData<T>(path)`.
- 값이 없으면 `undefined`.

### 데이터 정리

```ts
router.clear(path);
```

### 기타

```ts
router.back();  // router.back()
router.main();  // "/" 로 이동
```
