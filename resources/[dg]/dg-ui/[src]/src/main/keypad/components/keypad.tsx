import { FC } from 'react';
import * as React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';

export const Keypad: FC<{
  buttons: string[];
  setInputs: React.Dispatch<React.SetStateAction<string[]>>;
  finishInput: () => void;
}> = ({ buttons, setInputs, finishInput }) => {
  return (
    <div className='keypad'>
      <div className='grid'>
        <div className='button accept' onClick={finishInput}>
          <CheckIcon fontSize='large' />
        </div>
        <div className='button reset' onClick={() => setInputs([])}>
          <ClearIcon fontSize='large' />
        </div>
        {buttons.map((button, key) => (
          <div className='button' key={key} onClick={() => setInputs(s => [...s, button])}>
            <p>{button}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
