type SuccessMessageProps = {
  message?: string;
};

const SuccessMessage = ({ message }: SuccessMessageProps) => {
  if (!message) {
    return null;
  }
  return <p className="mt-4 text-sm text-emerald-600 text-center">{message}</p>;
};

export default SuccessMessage;
