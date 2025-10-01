import { useEffect, useRef, useState, useCallback } from 'react';
import { useResultStore } from '../store/resultStore';
import { showToast } from '../components/common/Toast';

interface UseSSEOptions {
  sessionId: string;
  enabled?: boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export const useSSE = ({
  sessionId,
  enabled = true,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5
}: UseSSEOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const {
    setCardInterpretation,
    setSummary,
    setProcessingStatus,
    setError: setStoreError,
    clearError: clearStoreError
  } = useResultStore();

  const handleEvent = useCallback((event: MessageEvent, eventType: string) => {
    try {
      const data = JSON.parse(event.data);

      switch (eventType) {
        case 'connected':
          console.log('SSE connected:', data);
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          setReconnectAttempts(0);
          clearStoreError();
          break;

        case 'status_changed':
          console.log('Status changed:', data);
          setProcessingStatus(data.status, data.message, data.progress);
          break;

        case 'card_interpreted': {
          console.log('Card interpreted:', data);
          const { position, interpretation } = data;
          const cardType = position === 1 ? 'past' : position === 2 ? 'present' : 'future';
          setCardInterpretation(cardType, interpretation);
          break;
        }

        case 'summary_generated':
          console.log('Summary generated:', data);
          setSummary(data.summary);
          break;

        case 'image_generated':
          console.log('Image generated:', data);
          // Image handling logic can be added here if needed
          break;

        case 'completed':
          console.log('Processing completed:', data);
          setProcessingStatus('COMPLETED', '모든 해석이 완료되었습니다!', 100);
          showToast.success('🔮 타로 해석이 완료되었습니다!');
          break;

        case 'error':
          console.error('SSE error event:', data);
          setStoreError(data.error || '알 수 없는 오류가 발생했습니다');
          showToast.error('해석 중 오류가 발생했습니다');
          break;

        default:
          console.log('Unknown SSE event:', eventType, data);
      }
    } catch (err) {
      console.error('Failed to parse SSE data:', err, event.data);
    }
  }, [setCardInterpretation, setSummary, setProcessingStatus, setStoreError, clearStoreError]);

  const connect = useCallback(() => {
    if (!sessionId || !enabled || eventSourceRef.current) {
      console.log('🚫 SSE connect skipped:', { sessionId, enabled, hasConnection: !!eventSourceRef.current });
      return;
    }

    console.log('🚀 Attempting SSE connection to sessionId:', sessionId);
    setIsConnecting(true);
    setError(null);

    try {
      // Backend SSE URL
      const sseUrl = `https://j13a601.p.ssafy.io/api/sessions/${sessionId}/events`;
      console.log('🔗 Creating EventSource for:', sseUrl);
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;

      // Connection opened
      eventSource.onopen = () => {
        console.log('✅ SSE connection opened successfully!');
      };

      // Generic message handler
      eventSource.onmessage = (event) => {
        handleEvent(event, 'message');
      };

      // Error handler
      eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        setIsConnected(false);
        setIsConnecting(false);

        if (reconnectAttempts < maxReconnectAttempts) {
          setError(`연결이 끊어졌습니다. 재연결 시도 중... (${reconnectAttempts + 1}/${maxReconnectAttempts})`);

          // Schedule reconnect directly here to avoid circular dependency
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }

          reconnectTimeoutRef.current = window.setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              eventSourceRef.current = null;
            }
            // Reconnect will happen in the next useEffect cycle
          }, reconnectDelay);
        } else {
          setError('서버와의 연결에 실패했습니다. 페이지를 새로고침해 주세요.');
          setStoreError('서버와의 연결이 끊어졌습니다');
          showToast.error('서버 연결에 실패했습니다');
        }
      };

      // Event-specific handlers
      eventSource.addEventListener('connected', (event: Event) => {
        handleEvent(event as MessageEvent, 'connected');
      });

      eventSource.addEventListener('status_changed', (event: Event) => {
        handleEvent(event as MessageEvent, 'status_changed');
      });

      eventSource.addEventListener('card_interpreted', (event: Event) => {
        handleEvent(event as MessageEvent, 'card_interpreted');
      });

      eventSource.addEventListener('summary_generated', (event: Event) => {
        handleEvent(event as MessageEvent, 'summary_generated');
      });

      eventSource.addEventListener('image_generated', (event: Event) => {
        handleEvent(event as MessageEvent, 'image_generated');
      });

      eventSource.addEventListener('completed', (event: Event) => {
        handleEvent(event as MessageEvent, 'completed');
      });

      eventSource.addEventListener('error', (event: Event) => {
        handleEvent(event as MessageEvent, 'error');
      });

    } catch (err) {
      console.error('❌ Failed to create SSE connection:', err);
      setError('서버 연결을 설정할 수 없습니다');
      setIsConnecting(false);
    }
  }, [sessionId, enabled, handleEvent, maxReconnectAttempts, reconnectAttempts, setStoreError, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectAttempts(0);
    // Connect will be triggered by useEffect when reconnectAttempts changes
  }, [disconnect]);

  // Auto-connect when enabled and sessionId is available
  useEffect(() => {
    if (enabled && sessionId && !eventSourceRef.current) {
      connect();
    }

    return disconnect;
  }, [sessionId, enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    reconnectAttempts,
    maxReconnectAttempts,
    reconnect,
    disconnect
  };
};