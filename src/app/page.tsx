import { redirect } from 'next/navigation'

// Supabase redirects to the Site URL (root) after email verification.
// Forward any auth params to the callback route before redirecting.
export default function RootPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const code = searchParams.code
  const token_hash = searchParams.token_hash
  const type = searchParams.type

  if (code) {
    redirect(`/auth/callback?code=${code}`)
  }
  if (token_hash && type) {
    redirect(`/auth/callback?token_hash=${token_hash}&type=${type}`)
  }

  redirect('/calendar')
}
