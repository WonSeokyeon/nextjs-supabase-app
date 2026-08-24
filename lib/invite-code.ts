// F002: 초대 코드 — 혼동되는 문자(0/O, 1/I)는 제외
const INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomInviteCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code +=
      INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }
  return code;
}
