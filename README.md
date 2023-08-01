GRINERGY SERVER v2

- APPLICATION 변경사항

  1. typescript 도입 for 타입안정성 [OK]
  1. validation 강화 [OK]
  1. TDD [OK]
  1. Redis를 활용한 캐싱 [Keep] ---> refresh token을 저장하는데 사용할 수 있겠으나 지금은 사용 X
  1. Github Actions를 통한 CI/CD [OK] -> frontend: push -> build -> s3 버킷 업로드 / backend: push -> test => lightsail에서 npm run start.
  1. 전반적인 코드 리펙토링 [OK]
  1. 관리자 로그인을 토큰key인증 -> session? JWT? [OK]
     -> Session을 하게 되면 loadbalancing이 어려움. 따로 redis를 두어야 하는데, 해봤자 10명정도 어드민 로그인을 할거 같은데 session으로 따로 레디스를 관리할 필요가 있을까?
     -> jwt 사용하면 프론트에서는 좀 귀찮겠지만, 따로 레디스 설정도 할 필요가 없으며, 성능도 더 좋을 듯. 추후에 Lambda로 백엔드를 전환하기에도 용이.
  1. 이미지 저장 시 리사이징
  1. multer-s3 적용
  1. search controller로 분리 및 pagination [ok]

- ARCHITECTURE 변경사항

  ### 후보

  - FRONTEND: route53 -> cloudfront, ACM -> s3
  - BACKEND: lightsail? aws lambda(코드 다시 짜야함..)? beanstalk
  - DB: MongoDB Atlas

  - aws shield, aws waf 등을 넣어야 할까? -> 보안이 중요한 웹은 아님.. 굳이 싶음.

  #### Serverful vs Serverless

  Serverless로 가는게 좋긴하겠다만.. 코드를 다시 또 짜야하며, 한번도 해본 적이 없음. 이건 추후에 정말로 서비스가 커졌을 때 진행하는 것이 좋아보임.
  -> Serverful

  #### Lightsail vs Elastic BeanStalk

  Lightsail은 쉽고, 안정적이고 다른 AWS의 서비스에 비해 굉장히 저렴하기에 간단한 애플리케이션 및 서비스를 호스팅하기 위한 최적의 방법, 단 인스턴스 사이즈가 너무 작아 걱정.. 트래픽 분석 필요
  EBS는 프로비저닝, 로드 밸런싱, 오토 스케일링, 모니터링 등의 프로덕션 레벨의 세팅을 자동으로 진행, 확장성과 트래픽에 대한 유연성이 좋음. 하지만, 요금을 절감하기 위해 세세한 설정이 필요한데 이를 위해서는 .ebextensions 에 대한 깊은 이해도가 필요

  -> grinergy backend는 무거운 기능은 없는듯. 있다면 lambda로 뺴두자. -> lightsail도 충분?
  -> lightsail

- Migration 계획

Backend를 먼저 AWS Lightsail에 배포 -> 기존 서버에서 backend를 내리고, 백엔드 엔드포인트만 aws로 옮김. -> 이후 aws s3로 프론트까지 배포

- FRONTEND

  1. useMutation, useSWR 사용
  1. Server Components 사용
