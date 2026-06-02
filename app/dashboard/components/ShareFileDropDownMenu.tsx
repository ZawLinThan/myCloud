import { ClickAwayListener } from '@mui/material';

const FilterDropDownMenu = () => {
  const className = `absolute right-0 top-20 z-20 w-36 overflow-hidden rounded-md border border-app surface py-1 shadow-drop-2`;
  return (
    <ClickAwayListener onClickAway={() => {}}>
      <div className={className}>hello</div>
    </ClickAwayListener>
  );
};

export default FilterDropDownMenu;
