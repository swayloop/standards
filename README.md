# @swayloop/standards

swayloop org 의 Tier 1 공통 config (`tsconfig` / `eslint` / `prettier`) 을 프로젝트에 한 번에 적용·갱신하는 CLI.

## 적용 명령 (consumer 프로젝트에서)

```bash
pnpm dlx @swayloop/standards apply
```

옵션:

```bash
pnpm dlx @swayloop/standards apply --dry-run        # 미리보기
pnpm dlx @swayloop/standards apply --cwd path/to    # 다른 디렉토리에 적용
pnpm dlx @swayloop/standards apply --no-install     # 패키지 설치 skip (이미 설치된 경우)
```

## apply 가 하는 일

1. **Tier 1 패키지 install** (`pnpm add -D`):
   - `@swayloop/tsconfig-base`
   - `@swayloop/prettier-config`
   - `@swayloop/eslint-config`
   - `eslint`, `prettier`, `typescript` (peer)

2. **`tsconfig.json`**:
   - 없으면 → `extends: "@swayloop/tsconfig-base/base.json"` 으로 생성
   - 있으면 → 이미 extend 되어 있는지 확인, 아니면 힌트만 출력 (덮어쓰지 않음)

3. **`eslint.config.js`**:
   - 없으면 → `import swayloopConfig from '@swayloop/eslint-config'` 로 생성
   - 있으면 → skip (덮어쓰지 않음)

4. **`package.json` prettier 필드 패치**:
   - `"prettier": "@swayloop/prettier-config"` 추가/유지

5. **`.prettierrc*` 존재 시 경고** — package.json prettier 필드와 충돌할 수 있어 제거 권장.

## 멱등성

같은 명령을 여러 번 돌려도 안전. 이미 적용된 항목은 skip, 사용자 커스텀 파일은 보존.

## 추가 안 하는 것

- husky / commitlint 설정 — 별도 `@swayloop/commitlint-config` 사용 (이미 적용된 repo 가정)
- AGENTS.md / CLAUDE.md — 프로젝트별 내용 다르므로 손대지 않음
- release-please 워크플로 — `swayloop/template-node` 에서 가져옴

## 표준

브랜치/커밋/릴리즈 규칙은 [swayloop/.github](https://github.com/swayloop/.github/blob/main/docs/workflow.md) 참고.
