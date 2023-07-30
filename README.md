GRINERGY SERVER v2

- APPLICATION 변경사항

  1. typescript 도입 for 타입안정성 [ok]
  1. validation 강화 [ok]
  1. TDD [ok]
  1. Redis를 활용한 캐싱 [ok]
  1. Github Actions를 통한 CI/CD
  1. 전반적인 코드 리펙토링 [ok]
  1. Rate Limiting
  1. 관리자 로그인을 토큰key인증 -> session 방식으로 구현. -> redis 필요 [ok]
  1. 이미지 저장 시 리사이징

- ARCHITECTURE 변경사항

  1. AWS로 이전.
  1. cloudflare ❌ -> AWS Cloudfront
  1. cloud storage 사용 -> cloudinary? s3?
  1. Redis -> elasticache? upstash?
  1. Serverless로 해야할랑가?

- FRONTEND

  1. useMutation, useSWR 사용
  1. Server Components 사용
