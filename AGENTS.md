# Agents

@swayloop/standards — Tier 1 공통 config (tsconfig / eslint / prettier) 을 프로젝트에 1회 명령으로 적용·갱신하는 CLI.

> 작업 영역에 맞는 파일만 필요할 때 read.

| 작업 영역 | 참고 파일 |
|---|---|
| 사용법 / 변경 의도 | [README.md](README.md) |
| CLI entry / 명령 라우팅 | [src/cli.ts](src/cli.ts) |
| apply 로직 (install + config 파일 생성/패치) | [src/apply.ts](src/apply.ts) |
