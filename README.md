# Cosmic Filament

> 생각은 빛나는 노드이고, 색인은 밀도가 높은 접점이며, 그 사이를 잇는 선은 필라멘트다.

**Cosmic Filament**는 색인된 생각들 사이에 이미 존재하는 연결을 자유 그래프로 보여 주는 정적 웹 앱입니다. 전체 생각망은 **Cosmic Web**이며, 앱은 의미를 새로 추론하지 않습니다. 두 생각이 가까운 이유는 언제나 둘이 공유하는 색인으로 설명됩니다.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111)
![Cytoscape.js](https://img.shields.io/badge/Cytoscape.js-3.34-7170ff)
![License](https://img.shields.io/badge/license-MIT-f7f8f8)

## 세계관

- **생각(Thought)** — 어둠 속에 놓인 하나의 빛
- **색인(Index)** — 여러 생각이 만나는 Cosmic Junction
- **연결(Link)** — 색인이 남긴 Filament
- **Cosmic Web** — 모든 생각과 색인이 함께 이루는 전체 구조
- **Little Light** — 이 우주를 돌아다니며 관찰하고 기록하는 존재

세계관은 화면의 언어를 만들지만 데이터 규칙을 흐리지 않습니다. 그래프에 없는 의미 관계를 AI가 임의로 추가하지 않습니다.

## 할 수 있는 일

- 노드를 드래그하고 그래프를 확대·축소하며 자유롭게 탐색
- **전체**: 모든 생각과 색인 보기
- **내 주변**: 선택한 노드에서 두 단계 안의 연결만 강조
- **겹침**: 둘 이상의 생각이 공유하는 색인과 연결된 생각만 강조
- 생각·색인 이름 검색
- 생각을 선택해 색인, 같은 색인을 공유하는 생각, 원문 경로 확인
- 모바일에서는 하단 시트, 데스크톱에서는 우측 패널로 상세 정보 표시

## 로컬 실행

```bash
npm ci
npm run dev
```

`http://localhost:5173/thoughts/`에서 가상 샘플 우주가 열립니다.

품질 확인:

```bash
npm test
npm run lint
npm run build
```

## 데이터 계약

앱은 `/thoughts/data/` 아래 세 파일을 읽습니다.

```text
thoughts.json  { "thoughts": [...] }
concepts.json  { "concepts": [...] }
links.json     { "edges": [...] }
```

최소 필드:

```json
{
  "thought": { "id": "thought-1", "title": "생각", "card_path": "cards/thought-1.md" },
  "concept": { "id": "concept-1", "name": "빛" },
  "edge": { "id": "edge-1", "source": "thought-1", "target": "concept-1", "type": "mentions" }
}
```

유효한 `thought → concept` 링크는 타입·확신도와 관계없이 기존 색인 결과로 보존됩니다. 존재하지 않는 source/target을 가리키는 링크는 화면을 왜곡하지 않도록 제외하고 진단 개수만 표시합니다.

`public/data/`와 `public/cards/`에는 공개용 **가상 데이터만** 있습니다. 실제 생각 원문, 실제 색인 JSON, 인증 정보는 이 저장소와 이미지에 넣지 않습니다.

## 컨테이너

```bash
docker build -t cosmic-filament:dev .
docker run --rm -p 8080:8080 cosmic-filament:dev
curl http://localhost:8080/healthz
```

앱 경로는 `/thoughts/`, 상태 확인 경로는 `/healthz`입니다. 런타임 이미지는 unprivileged nginx를 사용합니다.

홈랩에서는 앱 이미지와 개인 데이터를 분리합니다.

```text
public source + synthetic fixtures → container image
private Thought DB snapshot        → /thoughts/data + /thoughts/cards mount
shared ingress-nginx               → Service → Cosmic Filament nginx Pod
```

실제 데이터 디렉터리를 통째로 마운트해 샘플을 가리고, 인증은 HTML뿐 아니라 `/thoughts/data/`와 `/thoughts/cards/`에도 적용해야 합니다.

## 릴리스

`v*` 태그를 push하면 GitHub Actions가 테스트·린트·빌드를 통과한 뒤 멀티아키텍처 이미지를 GHCR에 게시합니다.

```text
ghcr.io/currenjin/cosmic-filament:<tag>
```

배포 저장소에서는 `latest` 대신 태그 또는 digest를 사용합니다.

## 저장소 경계

이 저장소에는 앱 소스, 가상 fixture, 스키마 계약, 테스트, Docker/nginx 설정만 둡니다. Kubernetes Deployment·Service·Ingress·인증 Secret과 실제 개인 데이터 게시 파이프라인은 비공개 homelab 저장소가 소유합니다.
