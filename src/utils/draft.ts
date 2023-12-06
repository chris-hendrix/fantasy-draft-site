export const getRound = (overall: number, teamsCount: number, noOverallValue: number = 99) => (
  overall ? Math.floor((overall - 1) / teamsCount) + 1 : noOverallValue
)

export const getRoundPick = (overall: number, teamsCount: number, noOverallValue: number = 99) => (
  overall ? ((overall - 1) % teamsCount) + 1 : noOverallValue
)

export const formatRoundPick = (overall: number, teamsCount: number) => {
  const round = String(getRound(overall, teamsCount)).padStart(2, '0')
  const roundPick = String(getRoundPick(overall, teamsCount)).padStart(2, '0')
  return `${round}:${roundPick}`
}
