import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "../package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Picky",
  version: pkg.version,
  description: "사용자의 웹 활동 로그를 기반으로 학습하여 맞춤형 콘텐츠를 추천하는 지능형 지식 동반자",
  oauth2: {
    client_id:
      "263377384158-59v1q0tl0ue430cnvj660spbfbh4t094.apps.googleusercontent.com",
    scopes: ["openid", "email", "profile"],
  },
  icons: {
    16: "public/picky_icon_16.png",
    48: "public/picky_icon_48.png",
    128: "public/picky_icon_128.png",
  },

  permissions: [
    "tabs",
    "storage",
    "history",
    "offscreen",
    "scripting",
    "identity",
  ],

  host_permissions: ["<all_urls>"],

  background: {
    service_worker: "src/background.js",
  },

  action: {
    default_popup: "src/popup/index.html",
    default_title: "Picky",
  },

  content_scripts: [
  // 1) 은행/증권/카드: 공개 정보 경로만 주입(관심 신호 확보)
  {
    matches: [
      // 은행
      "*://*.kbstar.com/news/*","*://*.kbstar.com/press/*","*://*.kbstar.com/notice/*","*://*.kbstar.com/ir/*","*://*.kbstar.com/investor/*","*://*.kbstar.com/blog/*",
      "*://*.hanafn.com/news/*","*://*.hanafn.com/press/*","*://*.hanafn.com/notice/*","*://*.hanafn.com/ir/*","*://*.hanafn.com/investor/*","*://*.hanafn.com/blog/*",
      "*://*.shinhan.com/news/*","*://*.shinhan.com/press/*","*://*.shinhan.com/notice/*","*://*.shinhan.com/ir/*","*://*.shinhan.com/investor/*","*://*.shinhan.com/blog/*",
      "*://*.wooribank.com/news/*","*://*.wooribank.com/press/*","*://*.wooribank.com/notice/*","*://*.wooribank.com/ir/*","*://*.wooribank.com/investor/*","*://*.wooribank.com/blog/*",
      "*://*.nhbank.com/news/*","*://*.nhbank.com/press/*","*://*.nhbank.com/notice/*","*://*.nhbank.com/ir/*","*://*.nhbank.com/investor/*","*://*.nhbank.com/blog/*",
      "*://*.ibk.co.kr/news/*","*://*.ibk.co.kr/press/*","*://*.ibk.co.kr/notice/*","*://*.ibk.co.kr/ir/*","*://*.ibk.co.kr/investor/*","*://*.ibk.co.kr/blog/*",
      "*://*.kakaobank.com/news/*","*://*.kakaobank.com/press/*","*://*.kakaobank.com/notice/*","*://*.kakaobank.com/ir/*","*://*.kakaobank.com/investor/*","*://*.kakaobank.com/blog/*",
      "*://*.tossbank.com/news/*","*://*.tossbank.com/press/*","*://*.tossbank.com/notice/*","*://*.tossbank.com/ir/*","*://*.tossbank.com/investor/*","*://*.tossbank.com/blog/*",
      "*://*.sc.co.kr/news/*","*://*.sc.co.kr/press/*","*://*.sc.co.kr/notice/*","*://*.sc.co.kr/ir/*",
      "*://*.citibank.co.kr/news/*","*://*.citibank.co.kr/press/*","*://*.citibank.co.kr/notice/*","*://*.citibank.co.kr/ir/*",
      "*://*.kbanknow.com/news/*","*://*.kbanknow.com/press/*","*://*.kbanknow.com/notice/*","*://*.kbanknow.com/ir/*",
      "*://*.busanbank.co.kr/news/*","*://*.busanbank.co.kr/notice/*",
      "*://*.kyongnambank.co.kr/news/*","*://*.kyongnambank.co.kr/notice/*",
      "*://*.dgb.co.kr/news/*","*://*.dgb.co.kr/notice/*",
      "*://*.jbbank.co.kr/news/*","*://*.jbbank.co.kr/notice/*",
      "*://*.suhyup-bank.com/news/*","*://*.suhyup-bank.com/notice/*",
      "*://*.kdb.co.kr/news/*","*://*.kdb.co.kr/notice/*",

      // 증권
      "*://*.kbsec.com/news/*","*://*.kbsec.com/notice/*",
      "*://*.nhqv.com/news/*","*://*.nhqv.com/notice/*",
      "*://*.shinhansec.com/news/*","*://*.shinhansec.com/notice/*",
      "*://*.miraeasset.com/news/*","*://*.miraeasset.com/notice/*",
      "*://*.samsungsecurities.co.kr/news/*","*://*.samsungsecurities.co.kr/notice/*",
      "*://*.kiwoom.com/news/*","*://*.kiwoom.com/notice/*",
      "*://*.truefriend.com/news/*","*://*.truefriend.com/notice/*",
      "*://*.daishin.com/news/*","*://*.daishin.com/notice/*",
      "*://*.ebestsec.co.kr/news/*","*://*.ebestsec.co.kr/notice/*",
      "*://*.hanaw.com/news/*","*://*.hanaw.com/notice/*",

      // 카드
      "*://*.kbcard.com/news/*","*://*.kbcard.com/notice/*",
      "*://*.hyundaicard.com/news/*","*://*.hyundaicard.com/notice/*",
      "*://*.shinhancard.com/news/*","*://*.shinhancard.com/notice/*",
      "*://*.samsungcard.com/news/*","*://*.samsungcard.com/notice/*",
      "*://*.bccard.com/news/*","*://*.bccard.com/notice/*",
      "*://*.lottecard.co.kr/news/*","*://*.lottecard.co.kr/notice/*",
      "*://*.nhcard.co.kr/news/*","*://*.nhcard.co.kr/notice/*",
      "*://*.wooricard.com/news/*","*://*.wooricard.com/notice/*",
      "*://*.hanacard.co.kr/news/*","*://*.hanacard.co.kr/notice/*"
      ],
      js: ["src/content.jsx"],
      run_at: "document_idle"
    },

    // 2) 전역 주입: 민감 URL/도메인 전역 차단 + 은행/증권/카드 전부 제외(공개 경로만 1번에서 주입)
    {
      matches: ["<all_urls>"],
      exclude_matches: [
        // 은행/증권/카드 전체(공개 경로는 1번에서만 주입)
        "*://*.kbstar.com/*","*://*.hanafn.com/*","*://*.shinhan.com/*","*://*.wooribank.com/*",
        "*://*.nhbank.com/*","*://*.ibk.co.kr/*","*://*.kakaobank.com/*","*://*.tossbank.com/*",
        "*://*.sc.co.kr/*","*://*.citibank.co.kr/*","*://*.kbanknow.com/*","*://*.busanbank.co.kr/*",
        "*://*.kyongnambank.co.kr/*","*://*.dgb.co.kr/*","*://*.jbbank.co.kr/*","*://*.suhyup-bank.com/*","*://*.kdb.co.kr/*",
        "*://*.kbsec.com/*","*://*.nhqv.com/*","*://*.shinhansec.com/*","*://*.miraeasset.com/*","*://*.samsungsecurities.co.kr/*",
        "*://*.kiwoom.com/*","*://*.truefriend.com/*","*://*.daishin.com/*","*://*.ebestsec.co.kr/*","*://*.hanaw.com/*",
        "*://*.kbcard.com/*","*://*.hyundaicard.com/*","*://*.shinhancard.com/*","*://*.samsungcard.com/*","*://*.bccard.com/*",
        "*://*.lottecard.co.kr/*","*://*.nhcard.co.kr/*","*://*.wooricard.com/*","*://*.hanacard.co.kr/*",

        // 로컬/파일
        "file://*/*","*://localhost:*/*","*://127.0.0.1:*/*",

        // OAuth/로그인
        "*://accounts.google.com/*","*://*.google.com/oauth/*","*://oauth.googleusercontent.com/*",

        // 이메일/메신저/협업
        "*://mail.google.com/*","*://mail.naver.com/*",
        "*://outlook.live.com/*","*://outlook.office.com/*","*://outlook.com/*",
        "*://web.telegram.org/*","*://web.whatsapp.com/*",
        "*://*.slack.com/*","*://teams.microsoft.com/*","*://*.discord.com/*","*://discord.com/*",
        "*://*.zoom.us/*","*://meet.google.com/*",

        // 클라우드/저장소
        "*://drive.google.com/*","*://*.dropbox.com/*","*://*.onedrive.live.com/*","*://*.sharepoint.com/*",
        "*://*.box.com/*","*://mega.nz/*","*://*.pcloud.com/*",

        // 결제/PG/간편결제
        "*://*.kakaopay.com/*","*://pay.naver.com/*","*://*.paypal.com/*",
        "*://toss.im/*","*://*.tosspayments.com/*","*://*.iamport.kr/*",
        "*://*.kcp.co.kr/*","*://*.nicepay.co.kr/*","*://*.kgmobilians.com/*","*://*.danal.co.kr/*",
        "*://www.payco.com/*","*://*.smilepay.com/*","*://pay.google.com/*","*://pay.apple.com/*","*://*.alipay.com/*","*://pay.weixin.qq.com/*",

        // 전역 민감 경로(보수적 차단)
        "*://*/*login*","*://*/*signin*","*://*/*logout*",
        "*://*/*2fa*","*://*/*mfa*","*://*/*verify*",
        "*://*/*profile*","*://*/*settings*","*://*/*mypage*",
        "*://*/*account*","*://*/*accounts*",
        "*://*/*billing*","*://*/*checkout*","*://*/*invoice*",
        "*://*/*payment*","*://*/*transfer*",
        "*://*/*loan*","*://*/*mortgage*",
        "*://*/*secure*","*://*/*cert*","*://*/*privacy*","*://*/*security*",

        // 정부/공공
        "*://*.go.kr/*","*://*.gov.kr/*","*://*.assembly.go.kr/*","*://*.president.go.kr/*","*://*.police.go.kr/*","*://*.court.go.kr/*","*://korea.kr/*",

        // 의료(대표)
        "*://med.naver.com/*","*://*.samsungmedicalcenter.com/*","*://*.amc.seoul.kr/*","*://*.snuh.org/*",

        // 성인(대표)
        "*://*.pornhub.com/*","*://*.xvideos.com/*","*://*.xnxx.com/*","*://*.xhamster.com/*",
        "*://*.spankbang.com/*","*://*.spankwire.com/*","*://*.youporn.com/*","*://*.redtube.com/*",
        "*://*.tube8.com/*","*://*.beeg.com/*","*://*.youjizz.com/*","*://*.tnaflix.com/*",
        "*://*.eporner.com/*","*://*.hqporner.com/*","*://*.manhub.com/*",
        "*://hitomi.la/*","*://nhentai.net/*","*://rule34.xxx/*","*://javlibrary.com/*","*://javdb.com/*","*://javmost.com/*","*://avsee.*/*",

        // 도박(대표)
        "*://*.bet365.com/*","*://*.stake.com/*","*://*.1xbet.com/*","*://*.betway.com/*",
        "*://*.williamhill.com/*","*://*.pokerstars.com/*","*://*.888.com/*","*://*.betfair.com/*",
        "*://*.pinnacle.com/*","*://*.bovada.lv/*",

        // 불법 스트리밍/토렌트(대표)
        "*://1337x.to/*","*://thepiratebay.org/*","*://yts.mx/*","*://nyaa.si/*",
        "*://fmovies.to/*","*://soap2day.to/*","*://putlocker.is/*","*://dramacool.app/*","*://kissasian.li/*"
      ],
      js: ["src/content.jsx"],
      run_at: "document_idle"
    }
  ],

  web_accessible_resources: [
    {
      resources: ["offscreen.html", "Readability.js", "content.css", "images/characters/*"],
      matches: ["<all_urls>"],
    },
  ],
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtuycTMbd69JMFauQR7RZCJIZf+oV186MrvigZGjgBPFV2wPEtRy7wtptxtYnm46AfCsCwSucZFydpNqILdyJfyLxS5xTt9Qlk/1xl73ZL7TsFSxtUQZVo+gwNPkxD3vnbwcer3BAbkRGTIvM3bxGoe7XVn/D3sK26BImM48u5jl1GQdCz8axsoCaI6NxBvx4cA8VovZK5tF4opiClS6amygzOe0IeJ7RePs9RMAHR4ia1thY1mMQPwabLDDQH7MiI2Qbth9c8G/5PCnrWc4oY5PtRs+5dH4BYKgWw3PE4JnBYgy7xfM2SwKaGiCk8Mvgu4gt93asfpvRtNAxZkDZgwIDAQAB",
});
