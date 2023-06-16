import { Slider as MUISlider } from '@mui/material';

const Slider = (props: { value: number[]; onChange: Function; minRange: number }) => {
  const handleChange = (event: Event, newValue: number | number[], activeThumb: number) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      props.onChange([Math.min(newValue[0], props.value[1] - props.minRange), props.value[1]]);
    } else {
      props.onChange([props.value[0], Math.max(newValue[1], props.value[0] + props.minRange)]);
    }
  };

  return <MUISlider value={props.value} onChange={handleChange} valueLabelDisplay='auto' disableSwap />;
};

export default Slider;
