-- Check the expenses in the BVI group
SELECT
  e.id,
  e.description,
  e.amount,
  e.paid_by,
  e.paid_by_pending_member,
  p.full_name as payer_name,
  p.email as payer_email,
  gm.pending_email as pending_payer_email,
  gm.status as pending_member_status,
  gm.user_id as pending_resolved_to_user_id
FROM expenses e
LEFT JOIN profiles p ON e.paid_by = p.id
LEFT JOIN group_members gm ON e.paid_by_pending_member = gm.id
WHERE e.group_id = '4e878e1e-a5d2-426c-a160-33fb9dee5926'
ORDER BY e.expense_date DESC;

-- Check the expense splits for these expenses
SELECT
  es.id,
  es.expense_id,
  es.user_id,
  es.pending_member_id,
  es.amount,
  p.full_name as user_name,
  p.email as user_email,
  gm.pending_email as pending_email,
  gm.status as pending_status,
  gm.user_id as pending_resolved_user_id
FROM expense_splits es
LEFT JOIN profiles p ON es.user_id = p.id
LEFT JOIN group_members gm ON es.pending_member_id = gm.id
WHERE es.expense_id IN (
  SELECT id FROM expenses WHERE group_id = '4e878e1e-a5d2-426c-a160-33fb9dee5926'
)
ORDER BY es.expense_id, es.id;
