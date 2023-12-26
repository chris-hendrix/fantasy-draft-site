import DraftYearTabs from './DraftYearTabs'

interface Props {
  leagueId: string;
}

const KeeperTab: React.FC<Props> = ({ leagueId }) => {
  const handleSelect = (draftId: string) => {
    console.log(draftId)
  }

  return (
    <div className="flex flex-col items-center mt-8">
      <DraftYearTabs leagueId={leagueId} onSelect={handleSelect} />
    </div>
  )
}

export default KeeperTab
