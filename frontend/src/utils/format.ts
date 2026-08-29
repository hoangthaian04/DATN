/**
 * Định dạng số tiền theo đơn vị VND hoặc USD
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'VND'
): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Định dạng khoảng lương
 * VD: "30.000.000 - 50.000.000 VND"
 */
export const formatSalaryRange = (
  min?: number,
  max?: number,
  currency: string = 'VND'
): string => {
  if (!min && !max) return 'Thỏa thuận';
  if (!min && max) return `Đến ${formatCurrency(max, currency)}`;
  if (min && !max) return `Từ ${formatCurrency(min, currency)}`;
  return `${formatCurrency(min!, currency)} - ${formatCurrency(max!, currency)}`;
};

/**
 * Định dạng ngày tháng theo locale Việt Nam
 * VD: "20/08/2026"
 */
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateString));
};

/**
 * Định dạng ngày giờ
 * VD: "20/08/2026 14:30"
 */
export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

/**
 * Thời gian tương đối (relative time)
 * VD: "3 ngày trước"
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

  if (diffSecs < 60) return 'Vừa xong';
  if (diffMins < 60) return rtf.format(-diffMins, 'minute');
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  return formatDate(dateString);
};
