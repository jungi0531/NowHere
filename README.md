# 🪷 지금여기 (NowHere)

<div align="center">
<img width="329" src="" />

**AI 맞춤형 명상 가이드 모바일 앱**

</div>

## 배포 주소

> **개발 버전** : 준비 중 <br>

## 개발자 소개

|     홍준기     |
| :-----------: |
| [@jungi0531](https://github.com/jungi0531) |
| 경북대학교<br>컴퓨터학부 3학년 |
| Full Stack |

## 프로젝트 소개

지금여기(NowHere)는 **오늘 나의 감정과 하루 경험을 반영한 AI 맞춤형 명상 가이드**를 제공하는 모바일 앱입니다.

기존 명상 앱들은 미리 만들어진 콘텐츠를 소비하는 구조입니다. 지금여기는 매일 나의 감정과 컨디션을 체크인하면, AI가 그날만의 명상 스크립트를 생성하고 자연스러운 한국어 TTS 음성으로 안내합니다.

**주요 특징:**
- 🧘 감정/컨디션 기반 AI 맞춤형 명상 스크립트 생성
- 🎙️ 자연스러운 한국어 TTS 음성 안내
- ⏱️ 명상 길이 선택
- 🪷 동자승 캐릭터
- 📅 명상 기록 & 연속 달성 스트릭

## Stacks

### Environment
![Android Studio](https://img.shields.io/badge/Android%20Studio-3DDC84?style=for-the-badge&logo=android-studio&logoColor=white)
![IntelliJ IDEA](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=for-the-badge&logo=intellij-idea&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=Git&logoColor=white)
![Github](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=GitHub&logoColor=white)

### Frontend
![Flutter](https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-0175C2?style=for-the-badge&logo=dart&logoColor=white)

### Backend
![Java](https://img.shields.io/badge/Java_17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)

### AI / 외부 API
![Claude](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![Naver](https://img.shields.io/badge/Naver_Clova_TTS-03C75A?style=for-the-badge&logo=naver&logoColor=white)
![Firebase](https://img.shields.io/badge/FCM-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 화면 구성

| 홈 화면  |  감정 체크인   |
| :-------------------------------------------: | :------------: |
|  <img width="329" src=""/> | <img width="329" src=""/> |
| 명상 진행 화면   |   명상 완료 화면   |
| <img width="329" src="" /> | <img width="329" src="" /> |

---

## 주요 기능

### ⭐️ AI 맞춤형 명상 스크립트 생성
- 오늘의 감정, 컨디션, 하루 키워드 체크인
- Claude API 기반 개인화 명상 스크립트 생성
- AI 제공사 교체 가능한 인터페이스 패턴 설계 (Claude → GPT → Gemini)

### ⭐️ TTS 음성 명상 안내
- Naver Clova Voice 기반 자연스러운 한국어 음성
- 명상 길이 선택 (3분 / 5분 / 10분)
- 호흡 타이밍, 시각화, 마음챙김 멘트 포함

### ⭐️ 동자승 캐릭터
- 홈 화면 상주 캐릭터
- 오늘의 감정 상태에 따라 표정/멘트 변화
- 명상 완료 후 반응 메시지

### ⭐️ 명상 기록 & 스트릭 (v2.0)
- 연속 명상 달성 스트릭
- 이번 달 명상 캘린더
- 감정 변화 트래킹

---