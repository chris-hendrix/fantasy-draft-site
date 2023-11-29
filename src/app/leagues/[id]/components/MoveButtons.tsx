'use client'

interface Props {
  indexToMove: number,
  array: any[],
  setArray: (iterable: any[]) => void
}

const MoveButtons: React.FC<Props> = ({ indexToMove, array, setArray }) => {
  const handleMove = (direction: 'up' | 'down' = 'up') => {
    const newIndex = direction === 'up' ? indexToMove - 1 : indexToMove + 1

    if (indexToMove >= 0 && newIndex >= 0 && newIndex < array.length) {
      const updated = [...array];
      [updated[indexToMove], updated[newIndex]] = [
        updated[newIndex], updated[indexToMove]
      ]
      setArray(updated)
    }
  }

  return (
    <>
      <button
        onClick={() => handleMove('up')}
        className="btn btn-xs btn-ghost btn-square">
        ⬆️
      </button>
      <button
        onClick={() => handleMove('down')}
        className="btn btn-xs btn-ghost btn-square mr-1">
        ⬇️
      </button>
    </>
  )
}

export default MoveButtons
