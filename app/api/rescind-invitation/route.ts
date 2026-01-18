import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId } = await request.json()

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
    }

    // Verify the invitation belongs to this user
    const { data: invitation } = await supabase
      .from('invitations')
      .select('id, invited_by')
      .eq('id', invitationId)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.invited_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to rescind this invitation' }, { status: 403 })
    }

    // Delete the invitation
    const { error: deleteError, count } = await supabase
      .from('invitations')
      .delete()
      .eq('id', invitationId)
      .select()

    if (deleteError) throw deleteError

    console.log(`Deleted ${count} invitation(s) with ID: ${invitationId}`)

    // Force Next.js to revalidate the friends page
    revalidatePath('/friends')
    revalidatePath('/friends', 'page')

    const response = NextResponse.json({ success: true, deleted: count })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (error: any) {
    console.error('Rescind invitation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to rescind invitation' }, { status: 500 })
  }
}
