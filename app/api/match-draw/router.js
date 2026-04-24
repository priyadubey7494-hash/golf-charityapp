import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req) {
  try {
    const { drawId } = await req.json()

    // Get draw numbers
    const { data: draw } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

    if (!draw) {
      return NextResponse.json({ error: 'Draw not found' })
    }

    const drawNumbers = draw.draw_numbers

    // Get all users with their scores
    const { data: users } = await supabase
      .from('profiles')
      .select('id')

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users found' })
    }

    // Calculate prize pool
    // Assuming 999 per user monthly
    const totalPool = users.length * 999
    const tier5Pool = totalPool * 0.40  // 40% jackpot
    const tier4Pool = totalPool * 0.35  // 35%
    const tier3Pool = totalPool * 0.25  // 25%

    let tier5Winners = []
    let tier4Winners = []
    let tier3Winners = []

    // Check each user scores against draw numbers
    for (const user of users) {
      const { data: scores } = await supabase
        .from('scores')
        .select('score_value')
        .eq('user_id', user.id)

      if (!scores || scores.length === 0) continue

      const userNumbers = scores.map(s => s.score_value)

      // Count matches
      const matches = userNumbers.filter(num =>
        drawNumbers.includes(num)
      ).length

      if (matches >= 5) tier5Winners.push(user.id)
      else if (matches === 4) tier4Winners.push(user.id)
      else if (matches === 3) tier3Winners.push(user.id)
    }

    // Calculate prize per winner in each tier
    const tier5Amount = tier5Winners.length > 0
      ? tier5Pool / tier5Winners.length
      : 0

    const tier4Amount = tier4Winners.length > 0
      ? tier4Pool / tier4Winners.length
      : 0

    const tier3Amount = tier3Winners.length > 0
      ? tier3Pool / tier3Winners.length
      : 0

    // Save tier 5 winners
    for (const userId of tier5Winners) {
      await supabase.from('winners').insert({
        draw_id: drawId,
        user_id: userId,
        tier: 5,
        amount: tier5Amount,
        status: 'pending'
      })
    }

    // Save tier 4 winners
    for (const userId of tier4Winners) {
      await supabase.from('winners').insert({
        draw_id: drawId,
        user_id: userId,
        tier: 4,
        amount: tier4Amount,
        status: 'pending'
      })
    }

    // Save tier 3 winners
    for (const userId of tier3Winners) {
      await supabase.from('winners').insert({
        draw_id: drawId,
        user_id: userId,
        tier: 3,
        amount: tier3Amount,
        status: 'pending'
      })
    }

    return NextResponse.json({
      message: 'Draw matching complete',
      results: {
        totalPool,
        tier5Winners: tier5Winners.length,
        tier4Winners: tier4Winners.length,
        tier3Winners: tier3Winners.length,
        jackpotRolledOver: tier5Winners.length === 0
      }
    })

  } catch (error) {
    return NextResponse.json({ error: error.message })
  }
}