"use client";

type DeleteSourceButtonProps = {
  action: () => Promise<void>;
};

export default function DeleteSourceButton({
  action,
}: DeleteSourceButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Supprimer cette source ? Ses observations seront également supprimées.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-900/70 px-3 py-2 text-sm text-red-400 transition hover:border-red-500 hover:text-red-300"
      >
        Supprimer
      </button>
    </form>
  );
}
