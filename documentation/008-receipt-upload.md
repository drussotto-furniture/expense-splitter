# Receipt Upload Feature - Final Setup Steps

The receipt upload feature has been mostly implemented! Here's what's been done and what you need to do to complete it:

## ✅ What's Already Done

1. **Added receipt file upload to AddExpenseButton**
   - File input field in the expense form
   - Upload logic to Supabase Storage
   - Updates expense record with receipt URL

2. **Created Supabase Storage setup SQL**
   - Storage bucket creation
   - RLS policies for upload/view/delete

## 🔧 Steps to Complete

### 1. Run the Storage Setup SQL

Go to your Supabase dashboard → SQL Editor and run the contents of `setup-storage.sql`:

```sql
-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false);

-- Allow authenticated users to upload receipts
CREATE POLICY "Users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view receipts in their groups
CREATE POLICY "Users can view receipts in their groups"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT e.id::text
    FROM expenses e
    JOIN group_members gm ON gm.group_id = e.group_id
    WHERE gm.user_id = auth.uid()
  )
);

-- Allow users to delete their own receipts
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2. Update ExpenseList Component to Display Receipts

Add this to `/components/expenses/ExpenseList.tsx`:

1. **Import Image icon:**
```typescript
import { Receipt, Image as ImageIcon, X } from 'lucide-react'
import { useState } from 'react'
```

2. **Add receipt_url to Expense interface:**
```typescript
interface Expense {
  // ... existing fields
  receipt_url: string | null
  // ... rest of fields
}
```

3. **Add receipt viewer state at the top of the component:**
```typescript
export default function ExpenseList({ expenses, splits, groupId, currentUserId, members }: ExpenseListProps) {
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)

  // ... existing code
```

4. **Add receipt display after the notes section** (around line 116):
```typescript
{expense.notes && (
  <p className="text-sm text-gray-600 mb-2">{expense.notes}</p>
)}

{expense.receipt_url && (
  <div className="mb-2">
    <button
      onClick={() => setViewingReceipt(expense.receipt_url)}
      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
    >
      <ImageIcon className="h-4 w-4" />
      View Receipt
    </button>
  </div>
)}
```

5. **Add receipt modal at the end of the component** (before the closing `</>` or final `</div>`):
```typescript
{viewingReceipt && (
  <div
    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
    onClick={() => setViewingReceipt(null)}
  >
    <div className="relative max-w-4xl w-full">
      <button
        onClick={() => setViewingReceipt(null)}
        className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
      >
        <X className="h-6 w-6" />
      </button>
      <img
        src={viewingReceipt}
        alt="Receipt"
        className="w-full h-auto rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  </div>
)}
```

### 3. Test the Feature

1. Go to a group
2. Click "Add Expense"
3. Fill in the expense details
4. Upload an image (receipt/photo)
5. Submit the expense
6. You should see "View Receipt" button on the expense
7. Click it to view the receipt in a modal

## 🎉 That's It!

Once you complete these steps, users will be able to:
- Upload receipt photos when creating expenses
- View receipts by clicking "View Receipt" button
- Receipts are stored securely in Supabase Storage
- Only group members can view receipts for expenses in their groups

## Troubleshooting

If receipts aren't uploading:
1. Check that the storage bucket was created (Supabase Dashboard → Storage)
2. Verify RLS policies are in place (Storage → Policies tab)
3. Check browser console for errors
4. Make sure the file is an image (accepts: image/*)

## Optional Enhancements

Later, you could add:
- Delete receipt functionality
- Support for PDF receipts
- Multiple receipt uploads per expense
- Receipt thumbnail previews in the expense list
- Image compression before upload
