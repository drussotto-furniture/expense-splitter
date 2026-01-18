import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { addedUserEmail, addedUserName, groupName, groupId } = await request.json()

    // Get inviter's name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const adderName = profile?.full_name || profile?.email || 'Someone'

    // Send email notification
    const { data, error } = await resend.emails.send({
      from: 'Expense Splitter <onboarding@resend.dev>',
      to: addedUserEmail,
      subject: `${adderName} added you to "${groupName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You've been added to a group!</h2>
          <p><strong>${adderName}</strong> has added you to the group <strong>"${groupName}"</strong> on Expense Splitter.</p>

          <p>You can now view and add expenses for this group.</p>

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/groups/${groupId}"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Group
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color: #2563eb;">Sign in</a>
            to view the group and start tracking expenses.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            You were added by ${adderName} (${profile?.email}).
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error: any) {
    console.error('Send notification error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
  }
}
