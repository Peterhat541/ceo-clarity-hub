import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteClientDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  isDeleting: boolean;
}

export function DeleteClientDialog({
  open,
  onClose,
  onConfirm,
  clientName,
  isDeleting,
}: DeleteClientDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            ¿Eliminar cliente?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Estás a punto de eliminar <strong className="text-foreground">"{clientName}"</strong>. 
            Esta acción no se puede deshacer y se perderán todos los datos asociados a este cliente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onClose}
            disabled={isDeleting}
            className="bg-secondary border-border hover:bg-secondary/80"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar cliente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
