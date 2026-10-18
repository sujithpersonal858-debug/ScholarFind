/**
 * Format currency in Indian Rupees (INR)
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || amount === '') return 'Not specified';
  const num = Number(amount);
  if (isNaN(num)) return amount;
  if (num === 0) return 'No limit';
  return '₹' + num.toLocaleString('en-IN');
}

/**
 * Format date in clean, readable format (e.g. 15 Nov 2026)
 */
export function formatDate(dateString) {
  if (!dateString) return 'Not announced';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get deadline urgency badge text and CSS modifier
 */
export function getDeadlineInfo(deadlineDate) {
  if (!deadlineDate) return { text: 'Open', isExpired: false, isUrgent: false };
  const deadline = new Date(deadlineDate);
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: 'Expired', isExpired: true, isUrgent: false, days: diffDays };
  }
  if (diffDays === 0) {
    return { text: 'Closes today', isExpired: false, isUrgent: true, days: 0 };
  }
  if (diffDays <= 7) {
    return { text: `Closes in ${diffDays} day${diffDays === 1 ? '' : 's'}`, isExpired: false, isUrgent: true, days: diffDays };
  }
  if (diffDays <= 30) {
    return { text: `Closes in ${diffDays} days`, isExpired: false, isUrgent: false, days: diffDays };
  }
  return { text: `Deadline: ${formatDate(deadlineDate)}`, isExpired: false, isUrgent: false, days: diffDays };
}
