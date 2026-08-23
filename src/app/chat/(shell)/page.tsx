import { MessageCircle } from "lucide-react";

export default function ChatEmptyPage() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-[12px] bg-[#EFF3FB] text-center">
      <MessageCircle className="size-[48px] text-[#C3CCDC]" />
      <p className="text-[14px] text-[#8A94A6]">왼쪽에서 대화를 선택해주세요</p>
    </div>
  );
}
