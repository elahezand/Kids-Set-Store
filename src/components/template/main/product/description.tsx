const Description = ({ description }: { description?: string }) => {
  if (!description) {
    return (
      <p className="text-gray-500 dark:text-gray-400">No description available.</p>
    );
  }

  return (
    <div className="max-w-prose whitespace-pre-line leading-7 text-gray-700 dark:text-gray-300">
      {description}
    </div>
  );
};

export default Description;
