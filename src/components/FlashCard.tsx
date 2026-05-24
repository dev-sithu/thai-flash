import consonants from '../data/th/consonants.json';
import vowels from '../data/th/vowels.json';
import numbers from '../data/th/numbers.json';
import { FC, useEffect, useState } from 'react';
import AudioButton from './AudioButton.tsx';
import { AppDispatch, RootState } from '../state/store.ts';
import { useDispatch, useSelector } from 'react-redux';
import { setCategory, setLastKey, setLetter, setPronunciation } from '../state/slices/cardSlice.ts';
import { getCleanName } from '../utils/common.ts';
import { useSwipeable } from 'react-swipeable';

const FlashCard: FC<FlashCardProps> = ({ category }) => {
  const {letter, lastKey, pronunciation} = useSelector((state: RootState) => state.card)
  const dispatch = useDispatch<AppDispatch>();
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Determine the current page title based on the route
  const getLetters = (category: string) => {
    switch (category) {
      case 'vowel':
        return vowels;
      case 'number':
        return numbers;
      default:
        return consonants;
    }
  };

  const getNext = (step: number = 1) => {
    let key: number;
    if (category === 'number') {
      if (lastKey === null) {
        key = step > 0 ? 0 : letters.length - 1;
      } else {
        key = (lastKey + step + letters.length) % letters.length;
      }
    } else {
      do {
        key = Math.floor(Math.random() * letters.length);
      } while (key === lastKey);
    }

    dispatch(setCategory(category))
    dispatch(setLetter(letters[key]))
    dispatch(setLastKey(key))
    dispatch(setPronunciation(false))
  }

  const letters = getLetters(category);

  useEffect(() => {
    getNext();
  }, []);

  const swipeHandler = useSwipeable({
    onSwiped: (eventData) => {
      const { deltaX } = eventData;
      if (deltaX > 0) {
        setSwipeDirection('right');
        changeCard(-1);
      } else {
        setSwipeDirection('left');
        changeCard(1);
      }
    },
  });

  const changeCard = (step?: number) => {
    setIsSwiping(true);
    setTimeout(() => {
      getNext(step);
      setIsSwiping(false);
      setSwipeDirection(null);
    }, 100);
  }

  const handleNext = () => {
    setSwipeDirection('right');
    changeCard(1);
  }

  if (letter === null) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <>
      <div
        className={`flash-card text-center flex flex-col justify-between transition-transform duration-300 ${
          isSwiping
            ? swipeDirection === 'left'
              ? '-translate-x-full opacity-0' // Swipe left
              : 'translate-x-full opacity-0' // Swipe right
            : 'translate-x-0 opacity-100' // Default position
        }`}
        {...swipeHandler}
      >
        <div className="h-full">
          <h2 className={`font-bold h-3/5 th-bold ${category} ${getCleanName(letter.english)}`}>
            {letter.thai}
          </h2>
          {letter?.meaning && <div className="text-3xl">{letter.meaning}</div>}
          <div className="flex justify-center items-center h-1/5">
            {pronunciation ? (
              <div className="pronunciation">
                <div className="text-3xl font-bold py-2 my-bold">
                  {letter.burmese}
                </div>
                <div className="text-3xl font-bold py-2">{letter.english}</div>
              </div>
            ) : (
              <button
                className="rounded-full bg-yellow-400 hover:bg-yellow-500 font-bold text-lg px-10 py-2"
                onClick={() => dispatch(setPronunciation(true))}
              >
                See Pronunciation
              </button>
            )}
          </div>
          <div className="audio flex justify-center items-center py-3">
            <AudioButton/>
          </div>
        </div>
      </div>
      <div className="text-center">
        <button
          className="rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-3xl my-4 px-10 py-2"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </>
  )
}

export default FlashCard;
