export const PAYMENT_METHODS = [
{ value: 'cash', label: 'Cash', icon: 'cash' },
{ value: 'gcash', label: 'GCash', icon: 'gcash' },
{ value: 'maribank', label: 'Maribank', icon: 'maribank' },
{ value: 'bdo', label: 'BDO', icon: 'bdo' },

] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number]['value'];

export const getPaymentMethodLabel = (value: string): string => {
  const method = PAYMENT_METHODS.find(m => m.value === value);
  return method ? method.label : value;
};

export const getPaymentMethodIcon = (value: string): string => {
  const method = PAYMENT_METHODS.find(m => m.value === value);
  return method ? method.icon : '💰';
};