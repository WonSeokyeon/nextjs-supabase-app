// F003: 카카오톡 공유 — Kakao JS SDK를 지연 로드하고 초대 링크를 공유한다.
// SDK 사용 전 Kakao Developers에서 발급받은 JavaScript 키를
// NEXT_PUBLIC_KAKAO_JS_KEY 환경 변수로 설정해야 한다.

interface KakaoShareLinkTarget {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoSdk {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (
      options:
        | {
            objectType: "feed";
            content: {
              title: string;
              description?: string;
              imageUrl: string;
              link: KakaoShareLinkTarget;
            };
            buttons: { title: string; link: KakaoShareLinkTarget }[];
          }
        | {
            objectType: "text";
            text: string;
            link: KakaoShareLinkTarget;
          },
    ) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

const KAKAO_SDK_SRC = "https://developers.kakao.com/sdk/js/kakao.js";
// Kakao feed 템플릿 description은 너무 길면 API가 거부하므로 안전하게 자른다
const DESCRIPTION_MAX_LENGTH = 76;

let loadPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (window.Kakao) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("카카오 SDK 로드에 실패했습니다"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

export class KakaoShareNotConfiguredError extends Error {
  constructor() {
    super("NEXT_PUBLIC_KAKAO_JS_KEY가 설정되지 않았습니다");
    this.name = "KakaoShareNotConfiguredError";
  }
}

export async function shareInviteLink(options: {
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
}): Promise<void> {
  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!jsKey) throw new KakaoShareNotConfiguredError();

  await loadKakaoSdk();
  if (!window.Kakao) throw new Error("카카오 SDK를 불러오지 못했습니다");
  if (!window.Kakao.isInitialized()) window.Kakao.init(jsKey);

  const link: KakaoShareLinkTarget = {
    mobileWebUrl: options.url,
    webUrl: options.url,
  };

  // 커버 이미지가 있으면 feed 템플릿(이미지 포함), 없으면 text 템플릿을 사용한다
  // — feed 템플릿은 imageUrl이 필수라 이미지가 없을 때 그대로 쓸 수 없다
  if (options.imageUrl) {
    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: options.title,
        description: options.description?.slice(0, DESCRIPTION_MAX_LENGTH),
        imageUrl: options.imageUrl,
        link,
      },
      buttons: [{ title: "이벤트 보기", link }],
    });
    return;
  }

  const text = options.description
    ? `${options.title}\n${options.description.slice(0, DESCRIPTION_MAX_LENGTH)}`
    : options.title;

  window.Kakao.Share.sendDefault({ objectType: "text", text, link });
}
