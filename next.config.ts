import type { NextConfig } from "next";

// F009: 이벤트 커버 이미지가 Supabase Storage 공개 URL에서 로드되므로
// next/image가 이 호스트를 신뢰하도록 등록해야 한다 (없으면 런타임 에러).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
