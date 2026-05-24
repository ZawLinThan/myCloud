import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

type AuthSubmitButtonProps = {
  isLoading: boolean;
  loadingText: string;
  text: string;
};

export default function AuthSubmitButton({
  isLoading,
  loadingText,
  text,
}: AuthSubmitButtonProps) {
  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-white shadow-drop-2 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-75 disabled:hover:translate-y-0"
      disabled={isLoading}
      type="submit"
    >
      {isLoading && (
        <AutorenewRoundedIcon className="animate-spin" fontSize="small" />
      )}
      {isLoading ? loadingText : text}
    </button>
  );
}
