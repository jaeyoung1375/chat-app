"use client";

// 소셜 로그인 3종 (Google / Kakao / GitHub) 브랜드 아이콘
const imgGoogle = "https://img.icons8.com/?id=17949&format=png&size=64";
const imgKakao = "https://img.icons8.com/?id=BH0XTdh770dG&format=png&size=64";
const imgGithub =
  "https://img.icons8.com/?id=12599&format=png&size=64&color=ffffff";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_OAUTH_GOOGLE_URL!;
  };

  const handleKakaoLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_OAUTH_KAKAO_URL!;
  };

  const handleGithubLogin = () => {
    window.location.href = process.env.NEXT_PUBLIC_OAUTH_GITHUB_URL!;
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F4F8FF] px-6 py-12">
      <div className="w-full max-w-[400px] rounded-2xl border border-[#E2E8F0] bg-white p-10 shadow-sm">
        <div className="mt-[24px] text-center"></div>

        <div className="mt-[36px] flex flex-col gap-[10px]">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex h-[46px] cursor-pointer items-center justify-center gap-[10px] rounded-[8px] border border-[#E2E8F0] bg-white transition-opacity hover:opacity-90"
          >
            <img src={imgGoogle} alt="" className="size-[16px]" />
            <span className="text-[13px] text-[#0B1220]">Google로 로그인</span>
          </button>

          <button
            type="button"
            onClick={handleKakaoLogin}
            className="flex h-[46px] cursor-pointer items-center justify-center gap-[10px] rounded-[8px] border-none bg-[#fee500] transition-opacity hover:opacity-90"
          >
            <img src={imgKakao} alt="" className="size-[16px]" />
            <span className="text-[13px] text-[#191919]">카카오로 로그인</span>
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex h-[46px] cursor-pointer items-center justify-center gap-[10px] rounded-[8px] border-none bg-[#181717] transition-opacity hover:opacity-90"
          >
            <img src={imgGithub} alt="" className="size-[16px]" />
            <span className="text-[13px] text-white">GitHub로 로그인</span>
          </button>
        </div>
      </div>
    </div>
  );
}
