import { ClickAwayListener } from '@mui/material';

type SortMode = 'recent' | 'name' | 'size';

interface FilterDropDownMenuProps {
  sortFunction: (type: SortMode) => void;
  onClose: () => void;
}

const FilterDropDownMenu = ({
  sortFunction,
  onClose,
}: FilterDropDownMenuProps) => {
  const className = `absolute right-0 top-15 z-20 w-48 mr-5 overflow-hidden rounded-md border border-app surface py-1 shadow-drop-2`;
  return (
    <ClickAwayListener onClickAway={onClose}>
      <div className={className}>
        <div className="flex items-center">
          <button
            className="flex-1 px-3 py-2 text-center text-sm font-medium text-muted transition hover:bg-black/5 hover:text-app"
            onClick={() => sortFunction('recent')}
            type="button"
          >
            Recent
          </button>
          <button
            className="flex-1 px-3 py-2 text-center text-sm font-medium text-muted transition hover:bg-black/5 hover:text-app"
            type="button"
            onClick={() => sortFunction('name')}
          >
            Name
          </button>
          <button
            className="flex-1 px-3 py-2 text-center text-sm font-medium text-muted transition hover:bg-black/5 hover:text-app"
            type="button"
            onClick={() => sortFunction('size')}
          >
            Size
          </button>
        </div>
      </div>
    </ClickAwayListener>
  );
};

export default FilterDropDownMenu;
