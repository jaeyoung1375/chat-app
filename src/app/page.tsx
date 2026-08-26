"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
import { post, setAccessToken } from "@/util/AxiosUtil";
import { connectStomp } from "@/util/StompUtil";

interface RefreshResponse {
  accessToken: string;
  isNew: boolean;
}

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    post<RefreshResponse>("/api/v1/auth/refresh")
      .then(({ data }) => {
        if (!active || !data) return;
        setAccessToken(data.accessToken);
        connectStomp();
        router.replace("/chat");
      })
      .catch(() => {
        // 로그인 세션(refreshToken 쿠키)이 없음 — 랜딩 페이지를 그대로 보여준다.
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>
            To get started, edit the{" "}
            <code className={styles.code}>page.tsx</code> file.
          </h1>
        </div>
      </main>
    </div>
  );
}
