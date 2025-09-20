#!/bin/bash

# 수동 롤백 스크립트
# 사용법: ./rollback.sh [태그]
# 태그를 지정하지 않으면 마지막 성공 버전으로 롤백

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="spring-app"
CONTAINER_NAME="backend-app"
IMAGE_NAME="taro-backend"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
COMPOSE_CMD="docker compose -f ${COMPOSE_FILE}"
LAST_SUCCESS_FILE="/tmp/last_successful_build.txt"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 도움말 출력
show_help() {
    echo "롤백 스크립트 사용법:"
    echo ""
    echo "  $0 [옵션] [태그]"
    echo ""
    echo "옵션:"
    echo "  -h, --help     이 도움말 출력"
    echo "  -l, --list     사용 가능한 이미지 태그 목록 출력"
    echo "  -s, --status   현재 실행 중인 서비스 상태 확인"
    echo ""
    echo "예시:"
    echo "  $0                     # 마지막 성공 버전으로 롤백"
    echo "  $0 42-a1b2c3d          # 특정 태그로 롤백"
    echo "  $0 --list              # 사용 가능한 태그 목록 보기"
    echo "  $0 --status            # 현재 상태 확인"
}

# 사용 가능한 이미지 태그 목록
list_available_tags() {
    log_info "사용 가능한 ${IMAGE_NAME} 이미지 태그:"
    docker images ${IMAGE_NAME} --format "table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | head -20
}

# 현재 서비스 상태 확인
check_status() {
    log_info "현재 서비스 상태:"
    echo ""
    
    if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "${CONTAINER_NAME}"; then
        log_info "컨테이너 상태:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "${CONTAINER_NAME}"
        
        echo ""
        log_info "현재 사용 중인 이미지:"
        docker inspect ${CONTAINER_NAME} --format '{{.Config.Image}}' 2>/dev/null || log_warn "컨테이너 정보를 가져올 수 없습니다"
        
        echo ""
        log_info "헬스체크 수행 중..."
        HOST_IP=$(ip -4 route show default | awk '{print $3}')
        if curl -fsS http://$HOST_IP:8080/actuator/health >/dev/null 2>&1; then
            log_info "✓ 서비스가 정상적으로 실행 중입니다"
        else
            log_error "✗ 서비스 헬스체크 실패"
        fi
    else
        log_warn "백엔드 컨테이너가 실행되지 않습니다"
    fi
    
    if [ -f "$LAST_SUCCESS_FILE" ]; then
        LAST_SUCCESS=$(cat $LAST_SUCCESS_FILE)
        log_info "마지막 성공 빌드: ${LAST_SUCCESS}"
    else
        log_warn "마지막 성공 빌드 정보가 없습니다"
    fi
}

# 롤백 실행
perform_rollback() {
    local target_tag="$1"
    
    log_info "롤백 시작: ${IMAGE_NAME}:${target_tag}"
    
    # 이미지 존재 확인
    if ! docker images ${IMAGE_NAME}:${target_tag} | grep -q "${target_tag}"; then
        log_error "이미지 ${IMAGE_NAME}:${target_tag}가 존재하지 않습니다"
        log_info "사용 가능한 태그 목록을 확인하세요: $0 --list"
        exit 1
    fi
    
    # 현재 컨테이너 중지
    log_info "현재 컨테이너 중지 중..."
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true
    
    # docker-compose.yml 업데이트
    log_info "docker-compose.yml 업데이트 중..."
    sed "s|image: ${IMAGE_NAME}.*|image: ${IMAGE_NAME}:${target_tag}|g" ${COMPOSE_FILE} > ${COMPOSE_FILE}.tmp
    mv ${COMPOSE_FILE}.tmp ${COMPOSE_FILE}
    
    # 서비스 시작
    log_info "서비스 시작 중..."
    ${COMPOSE_CMD} up -d ${SERVICE_NAME}
    
    # 헬스체크 대기
    log_info "서비스 헬스체크 대기 중 (최대 3분)..."
    for i in {1..36}; do
        HOST_IP=$(ip -4 route show default | awk '{print $3}')
        if curl -fsS http://$HOST_IP:8080/actuator/health >/dev/null 2>&1; then
            log_info "✓ 롤백 완료! 서비스가 정상적으로 실행 중입니다"
            log_info "현재 실행 중인 이미지: ${IMAGE_NAME}:${target_tag}"
            return 0
        fi
        echo -n "."
        sleep 5
    done
    
    echo ""
    log_error "헬스체크 실패 - 서비스가 정상적으로 시작되지 않았습니다"
    log_info "컨테이너 로그:"
    docker logs ${CONTAINER_NAME} --tail=50
    exit 1
}

# 메인 로직
main() {
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--list)
            list_available_tags
            exit 0
            ;;
        -s|--status)
            check_status
            exit 0
            ;;
        "")
            # 태그가 지정되지 않은 경우 마지막 성공 버전으로 롤백
            if [ -f "$LAST_SUCCESS_FILE" ]; then
                ROLLBACK_TAG=$(cat $LAST_SUCCESS_FILE)
                log_info "마지막 성공 버전으로 롤백합니다: ${ROLLBACK_TAG}"
                perform_rollback "${ROLLBACK_TAG}"
            else
                log_error "마지막 성공 빌드 정보가 없습니다"
                log_info "사용 가능한 태그를 확인하고 수동으로 지정하세요: $0 --list"
                exit 1
            fi
            ;;
        *)
            # 특정 태그로 롤백
            ROLLBACK_TAG="$1"
            log_warn "특정 태그로 롤백합니다: ${ROLLBACK_TAG}"
            read -p "계속하시겠습니까? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                perform_rollback "${ROLLBACK_TAG}"
            else
                log_info "롤백이 취소되었습니다"
                exit 0
            fi
            ;;
    esac
}

# Docker 접근 권한 확인
if ! docker ps >/dev/null 2>&1; then
    log_error "Docker에 접근할 수 없습니다. 권한을 확인하세요"
    exit 1
fi

# Compose 파일 존재 확인
if [ ! -f "$COMPOSE_FILE" ]; then
    log_error "docker-compose.yml 파일을 찾을 수 없습니다: $COMPOSE_FILE"
    exit 1
fi

main "$@"