export const getRound = (overall: number, teamsCount: number) => (
  Math.floor((overall - 1) / teamsCount) + 1
)

export const getRoundPick = (overall: number, teamsCount: number) => (
  ((overall - 1) % teamsCount) + 1
)

export const formatRoundPick = (overall: number, teamsCount: number) => {
  const round = String(getRound(overall, teamsCount)).padStart(2, '0')
  const roundPick = String(getRoundPick(overall, teamsCount)).padStart(2, '0')
  return `${round}:${roundPick}`
}
