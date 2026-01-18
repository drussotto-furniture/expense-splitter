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

    const { invitedEmail, groupName, groupId } = await request.json()

    // Get inviter's name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const inviterName = profile?.full_name || profile?.email || 'Someone'

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Expense Splitter <onboarding@resend.dev>', // You'll need to update this with your verified domain
      to: invitedEmail,
      subject: `${inviterName} invited you to join "${groupName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">You've been invited!</h2>
          <p><strong>${inviterName}</strong> has invited you to join the group <strong>"${groupName}"</strong> on Expense Splitter.</p>

          <p>Expense Splitter makes it easy to split expenses with friends, roommates, or travel companions.</p>

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/signup?invited=true"
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Sign Up & Accept Invitation
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            Already have an account?
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color: #2563eb;">Sign in</a>
            and go to your Invitations page to accept.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <p style="color: #999; font-size: 12px;">
            This invitation was sent by ${inviterName} (${profile?.email}).
            If you don't know this person, you can safely ignore this email.
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
    console.error('Send invitation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 })
  }
}
