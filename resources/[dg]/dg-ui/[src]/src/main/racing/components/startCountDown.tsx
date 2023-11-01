export const StartCountDown = (props: { countDown: number; setCountDown: (cd: number) => void }) => {
  return (
    <div className='racing-start-container center'>
      <div className='racing-start-circle'>
        <p>{props.countDown}</p>
      </div>
    </div>
  );
};
