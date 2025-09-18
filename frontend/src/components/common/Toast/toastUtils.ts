import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: 'var(--color-primary-800)',
        color: 'var(--color-primary-200)',
        border: '1px solid var(--color-accent-400)',
        borderRadius: '12px',
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '0.95rem',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      iconTheme: {
        primary: 'var(--color-accent-400)',
        secondary: 'var(--color-primary-900)',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: 'var(--color-primary-800)',
        color: 'var(--color-primary-200)',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '0.95rem',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: 'var(--color-primary-200)',
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      style: {
        background: 'var(--color-primary-800)',
        color: 'var(--color-primary-200)',
        border: '1px solid var(--color-primary-600)',
        borderRadius: '12px',
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '0.95rem',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: 'var(--color-primary-800)',
        color: 'var(--color-primary-200)',
        border: '1px solid var(--color-primary-600)',
        borderRadius: '12px',
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '0.95rem',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
    });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, messages, {
      style: {
        background: 'var(--color-primary-800)',
        color: 'var(--color-primary-200)',
        border: '1px solid var(--color-primary-600)',
        borderRadius: '12px',
        fontFamily: 'Pretendard, sans-serif',
        fontSize: '0.95rem',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      success: {
        iconTheme: {
          primary: 'var(--color-accent-400)',
          secondary: 'var(--color-primary-900)',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: 'var(--color-primary-200)',
        },
      },
    });
  },
};

export default showToast;