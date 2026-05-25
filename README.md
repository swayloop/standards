# swayloop-template-node

swayloop org 의 Node 프로젝트 부트스트랩 템플릿. husky + commitlint + release-please + reusable workflows 가 미리 셋업되어 있습니다.

## 새 프로젝트로 시작하기

```bash
npx degit swayloop/template-node my-app
cd my-app
git init && git checkout -b main
pnpm install
git add -A && git commit -m "chore: bootstrap from swayloop/template-node"
```

그 다음:

1. `package.json` 의 `name`, `description` 수정
2. GitHub 에 레포 생성: `gh repo create swayloop/my-app --private --source=. --remote=origin --push`
3. 첫 브랜치는 `git checkout -b dev` 로 만들고 dev 를 디폴트 브랜치로 설정
4. 시크릿 추가: `gh secret set CLAUDE_CODE_OAUTH_TOKEN -R swayloop/my-app` (claude 워크플로우 쓸 경우)

## 무엇이 들어있나

| 파일 | 역할 |
|---|---|
| `.husky/commit-msg` | commitlint 검사 |
| `.husky/pre-push` | 브랜치 네이밍 규칙 강제 |
| `.husky/pre-commit` | (스텁) 프로젝트 lint/format 추가 |
| `commitlint.config.js` | `@swayloop/commitlint-config` extend |
| `.nvmrc` | Node 20 |
| `release-please-config.json`, `.release-please-manifest.json` | 릴리즈 자동화 |
| `.github/workflows/release-please.yml` | org reusable 호출 |
| `.github/workflows/auto-close-issues.yml` | org reusable 호출 |
| `.github/workflows/claude-mention.yml` | `@claude` 멘션 응답 (org reusable) |
| `.github/workflows/ci.yml` | lint/build/test (스크립트 있을 때만 실행) |

## 표준

브랜치/커밋/릴리즈 규칙은 [swayloop/.github](https://github.com/swayloop/.github/blob/main/docs/workflow.md) 참고.

- 브랜치: `feature → dev → main`
- 브랜치명: `<type>/<issue#>-<desc>`
- 커밋: Conventional Commits
- 릴리즈: dev → main 머지 시 release-please 가 자동 처리
