# Jenkins 파이프라인 개선 사항 요약

## 문제점
- 기존 파이프라인에서 빌드 실패 시 서비스가 중단됨
- 롤백 메커니즘이 없어 수동 복구 필요
- 이미지 버전 관리 부재

## 해결 방법

### 1. 태그 기반 이미지 관리
```groovy
BUILD_TAG = "${BUILD_NUMBER}-${GIT_COMMIT[0..7]}"
```
- 각 빌드마다 고유한 태그 생성 (예: `42-a1b2c3d`)
- Git 커밋 해시와 빌드 번호 조합으로 추적 가능

### 2. 자동 롤백 시스템

#### 헬스체크 실패 시 즉시 롤백
```groovy
post {
  failure {
    // 이전 성공 이미지로 자동 롤백
    sh 'rollback_to_previous_version'
  }
}
```

#### 빌드 실패 시 응급 롤백
- 전체 파이프라인 실패 시에도 서비스 복구
- 실패한 이미지 자동 정리

### 3. 성공 버전 추적
```bash
echo "$CURRENT_TAG" > /tmp/last_successful_build.txt
```
- 성공한 배포마다 태그 저장
- 롤백 시 참조 데이터로 활용

### 4. 안전한 배포 프로세스

#### 단계별 검증
1. **이미지 빌드 및 태깅**
2. **컨테이너 배포**  
3. **헬스체크 수행** (3분 타임아웃)
4. **성공 시 태그 저장**
5. **실패 시 자동 롤백**

#### 이미지 정리
- 최근 3개 버전만 보관
- 디스크 공간 자동 관리

## 추가 도구

### 수동 롤백 스크립트 (`rollback.sh`)
```bash
# 마지막 성공 버전으로 롤백
./rollback.sh

# 특정 버전으로 롤백
./rollback.sh 42-a1b2c3d

# 상태 확인
./rollback.sh --status
```

## 장점

1. **Zero Downtime**: 실패 시에도 서비스 지속
2. **자동 복구**: 인간 개입 없이 자동 롤백
3. **버전 추적**: 배포 히스토리 관리
4. **운영 편의성**: 간단한 수동 롤백 도구
5. **안정성**: 단계별 검증으로 안전한 배포

## 사용법

### Jenkins에서 자동 실행
- 코드 푸시 시 자동 빌드 및 배포
- 실패 시 자동 롤백

### 수동 롤백 (긴급 상황)
```bash
cd /path/to/backend
./rollback.sh
```

### 모니터링
```bash
# 현재 실행 버전 확인
docker inspect backend-app --format '{{.Config.Image}}'

# 마지막 성공 빌드 확인
cat /tmp/last_successful_build.txt
```