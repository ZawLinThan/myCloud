import { ClickAwayListener } from '@mui/material';

const FilterDropDownMenu = () => {
  const className = `absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-md border border-app surface py-1 shadow-drop-2`;
  return (
    <ClickAwayListener onClickAway={() => {}}>
      <div className={className}>
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-muted transition hover:bg-black/5 hover:text-app"
          //onClick={onShare}
          type="button"
        >
          Share
        </button>
        <button
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
        >
          Delete
        </button>
      </div>
    </ClickAwayListener>
  );
};

export default FilterDropDownMenu;
