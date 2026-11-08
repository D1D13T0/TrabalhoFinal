import { Button, Dialog, Portal, Text } from "react-native-paper";

interface Props {
  visivel: boolean;
  titulo?: string;
  mensagem: string;
  excluindo?: boolean;
  bloqueado?: boolean; // true quando a exclusão não é permitida (só mostra o aviso)
  onCancelar: () => void;
  onConfirmar: () => void;
}

// Diálogo modal de confirmação antes de excluir qualquer registro.
export function ConfirmarExclusao({ visivel, titulo, mensagem, excluindo, bloqueado, onCancelar, onConfirmar }: Props) {
  return (
    <Portal>
      <Dialog visible={visivel} onDismiss={excluindo ? undefined : onCancelar}>
        <Dialog.Icon icon={bloqueado ? "lock-outline" : "alert-circle-outline"} />
        <Dialog.Title style={{ textAlign: "center" }}>
          {titulo ?? (bloqueado ? "Não é possível excluir" : "Confirmar exclusão")}
        </Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{mensagem}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          {/* Dialog.Actions repassa props aos filhos diretos, então nada de Fragment aqui. */}
          {bloqueado
            ? [
                <Button key="ok" mode="contained" onPress={onCancelar}>
                  Entendi
                </Button>,
              ]
            : [
                <Button key="cancelar" onPress={onCancelar} disabled={excluindo}>
                  Cancelar
                </Button>,
                <Button
                  key="excluir"
                  mode="contained"
                  buttonColor="#BB1D2D"
                  textColor="#FFFFFF"
                  onPress={onConfirmar}
                  loading={excluindo}
                  disabled={excluindo}
                >
                  Excluir
                </Button>,
              ]}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
